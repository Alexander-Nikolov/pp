function getSocket(server) {
    var io = require('socket.io', {
        rememberTransport: false,
        transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling']
    }).listen(server);

    server.lastPlayerID = 0;
    server.lastUserID = 0;
    server.connectedUsers = 0;
    server.matchTime = server.matchTime || 300000;
    server.haveTimer = false;
    server.rooms = [];

    serverObjects = [];

    io.on('connection', function (socket) {
        if (!server.haveTimer) {
            server.haveTimer = true;
            timer = setInterval(function () {
                server.matchTime -= 1000;
                if (server.matchTime <= 0) {
                    io.emit('stopGame');
                    clearInterval(timer);
                    server.haveTimer = false;
                    server.matchTime = 300000;
                }
            }, 1000);
        }

        socket.on('newUserChat', function (data) {
            if (!data || isSamePerson(data.username, socket.id, true)) {
                return;
            }
            socket.user = {
                username: data.username,
                imageURL: data.avatarURL,
                color: "000",
                id: server.lastUserID++,
                inChatWith: "",
                inChatWithUsers: {}
            };

            sendSystemMessage('User: ' + socket.user.username + ' connected', socket, {color: "#0a0"});

            socket.broadcast.emit('newUser', socket.user);
            io.to(socket.id).emit('userInfo', {user: socket.user, users: getAllUsers(socket)});

            socket.on('createRoom', function (user) {
                var roomName = socket.user.username + user;
                socket.join(roomName);
                socket.user.inChatWithUsers[user] = {
                    name: roomName
                };
                server.rooms.push(roomName);
                var otherUserId = findSocketIdByUsername(user);
                io.to(otherUserId).emit('joinGroup', socket.user.username);
            });

            socket.on('joinGroup', function (user) {
                var roomName = user + socket.user.username;
                socket.join(roomName);
                socket.user.inChatWithUsers[user] = {
                    name: roomName
                };
            });

            socket.on('newMessage', function (data) {
                if (data.room) {
                    socket.broadcast.in(data.room).emit('newMessage', {
                        message: data.message,
                        sender: socket.user.username,
                        id: socket.user.id,
                        isForRoom: true
                    });
                } else {
                    socket.broadcast.emit('newMessage', {
                        message: data.message,
                        sender: socket.user.username,
                        id: socket.user.id
                    });
                }
            });

            socket.on('disconnect', function () {
                io.emit('remove', socket.user.id);
                deleteRooms(socket);
                sendSystemMessage('User: ' + socket.user.username + ' disconnected', undefined, {color: "#D21C1E"});
            });
            socket.on('disconnectPage', function () {
                deleteRooms(socket);
                io.emit('remove', socket.user.id);
                sendSystemMessage('User: ' + socket.user.username + ' disconnected', undefined, {color: "#D21C1E"});
            });
        });

        socket.on('newplayer', function (data) {
            server.connectedUsers++;
            socket.player = data.char;
            socket.player.isHost = false;
            socket.player.id = server.lastPlayerID++;
            socket.player.username = data.username;
            socket.player.health = 100;
            socket.player.energy = 100;
            socket.player.isInAir = false;
            socket.player.busy = false;
            socket.player.canAttackAgain = true;
            socket.player.alive = true;
            socket.player.isFlinched = false;
            socket.player.canBeHitted = true;
            socket.player.changingOffset = false;
            socket.player.oldCropX = 0;
            socket.player.oldCropY = 0;
            socket.player.kills = 0;
            socket.player.deaths = 0;
            socket.player.score = 0;

            isSamePerson(socket.player.username, socket.id);
            if (server.connectedUsers > 1) {
                socket.broadcast.emit('requireUpdate', socket.player.id);
            } else {
                io.to(socket.id).emit('createMap', serverObjects);
            }

            socket.on('updateServerObjects', function (data) {
                serverObjects = data.objects;
                if (!data.newplayer) {
                    Object.keys(io.sockets.connected).forEach(function (socketID) {
                        if (io.sockets.connected[socketID].player && io.sockets.connected[socketID].player.id == data.id) {
                            io.to(socketID).emit('createMap', serverObjects);
                        }
                    });
                }
            });

            socket.on('startGame', function () {
                socket.on('score', function (data) {
                    Object.keys(data).forEach(function (key) {
                        socket.player[key] = data[key];
                    });
                    allUsers.find({username: socket.player.username}).then(function (user) {
                        var player = user[0];
                        var killsSum = data.kills + player.kills;
                        var deathsSum = data.deaths + player.deaths;
                        var scoreSum = data.score + player.score;
                        allUsers.update({username: socket.player.username}, {
                            $set: {
                                kills: killsSum,
                                deaths: deathsSum,
                                score: scoreSum
                            }
                        }).then(function () {
                            io.to(socket.id).emit('endGame');
                        });
                    });
                });

                socket.on('createPlayer', function (data) {
                    socket.emit('allplayers', {
                        players: getAllPlayers(),
                        id: socket.player.id,
                        timer: server.matchTime
                    });
                    socket.broadcast.emit('newplayer', socket.player);
                });

                socket.on('updatePlayer', function (data) {
                    Object.keys(data).forEach(function (key) {
                        socket.player[key] = data[key];
                    });
                });

                socket.on('updatePlayers', function () {
                    socket.broadcast.emit('updatePlayer', socket.player.id);
                });

                socket.on('syncObjects', function (data) {
                    socket.broadcast.emit('syncObjects', data);
                });

                socket.on('sync', function (data) {
                    socket.broadcast.emit('sync', {id: socket.player.id, x: data.x, y: data.y});
                });

                socket.on('act', function (data) {
                    socket.broadcast.emit('act', {id: socket.player.id, act: data.act, cause: data.cause});
                });

                socket.on('disconnect', function () {
                    server.connectedUsers--;
                    if (socket.player.isHost && server.connectedUsers != 0) {
                        var foundNewHost = false;
                        Object.keys(io.sockets.connected).forEach(function (socketID) {
                            if (socketID != socket.id && !foundNewHost) {
                                io.sockets.connected[socketID].player.isHost = true;
                                io.to(socketID).emit('changeHost');
                                foundNewHost = true;
                            }
                        });
                    }
                    io.emit('removePlayer', socket.player.id);
                });
            });
        });
    });

    var sendSystemMessage = function (message, socket, moreInfo) {
        if (socket) {
            socket.broadcast.emit('newMessage', {
                message: message,
                sender: "sm",
                moreInfo: moreInfo
            })
        } else {
            io.emit('newMessage', {
                message: message,
                sender: "sm",
                moreInfo: moreInfo
            })
        }
    };

    var deleteRooms = function (socket) {
        Object.keys(socket.user.inChatWithUsers).forEach(function (user) {
            var roomName1 = socket.user.username + user;
            var roomName2 = user + socket.user.username;
            var index1 = server.rooms.indexOf(roomName1);
            var index2 = server.rooms.indexOf(roomName2);
            if (index1 !== -1) {
                server.rooms.splice(index1, 1);
            } else if (index2 !== -1) {
                server.rooms.splice(index2, 1);
            }
        });
    };

    var findSocketIdByUsername = function (username) {
        var userID;
        Object.keys(io.sockets.connected).forEach(function (socketID) {
            if (io.sockets.connected[socketID].user && io.sockets.connected[socketID].user.username === username) {
                userID = socketID;
            }
        });
        return userID;
    };

    var isSamePerson = function (username, id, isChat) {
        return Object.keys(io.sockets.connected).forEach(function (socketID) {
            if (isChat) {
                if (io.sockets.connected[socketID].user && io.sockets.connected[socketID].user.username == username && socketID != id) {
                    io.to(id).emit('samePersonChat');
                }
            } else {
                if (io.sockets.connected[socketID].player && io.sockets.connected[socketID].player.username == username && socketID != id) {
                    io.to(id).emit('samePerson');
                }
            }
        });
    };

    function getAllUsers(socket) {
        var users = [];
        Object.keys(io.sockets.connected).forEach(function (socketID) {
            var user = io.sockets.connected[socketID].user;
            if (user && user.id !== socket.user.id) users.push(user);
        });
        return users;
    }


    function getAllPlayers() {
        var players = [];
        Object.keys(io.sockets.connected).forEach(function (socketID) {
            var player = io.sockets.connected[socketID].player;
            if (server.connectedUsers == 1 && player) {
                player.isHost = true;
            }
            if (player) players.push(player);
        });
        return players;
    }
}

module.exports.getSocket = getSocket;