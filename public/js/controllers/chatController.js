app.controller('chatController', function ($scope, info, $sce, $http, $filter, $rootScope, $interval, $timeout, $controller, $location) {
    $scope.chatClient = $scope.Client;
    if ($scope.chatClient.socket.disconnected) {
        $scope.chatClient.socket = io.connect();
    }

    // emit functions
    $scope.chatClient.newUserChat = function (user) {
        $scope.chatClient.socket.emit('newUserChat', user);
    };

    $scope.chatClient.newMessage = function (message) {
        $scope.chatClient.socket.emit('newMessage', message);
    };

    $scope.chatClient.chatWithUser = function (username) {
        if (!$scope.user.inChatWithUsers[username]) {
            $scope.user.inChatWithUsers[username] = {
                name: $scope.user.username + username,
                messages: ""
            };
            $scope.chatClient.socket.emit('createRoom', username);
        }
        $scope.changeChatView(username);
    };

    $scope.chatClient.socket.on('joinGroup', function (user) {
        $scope.user.inChatWithUsers[user] = {
            name: user + $scope.user.username,
            messages: ""
        };
        $scope.$apply();
        $scope.chatClient.socket.emit('joinGroup', user);
    });

    // on functions
    $scope.chatClient.socket.on('samePersonChat', function () {
        $scope.chatClient.socket.disconnect();
    });

    $scope.chatClient.socket.on('newMessage', function (data) {
        $scope.addMessage(data.message, data.sender, false, data.id, data.isForRoom, data.moreInfo);
        $scope.$apply();
    });

    $scope.chatClient.socket.on('userInfo', function (data) {
        $scope.user = data.user;
        $scope.user.imageURL += '?' + new Date();
        $scope.user.color = ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
        $scope.user.isBlocked = false;
        $scope.user.recentMessages = 0;
        data.users.forEach(function (user) {
            $scope.users[user.id] = $scope.createUser(user);
        });
        $scope.$apply();
    });

    $scope.chatClient.socket.on('newUser', function (data) {
        $scope.users[data.id] = $scope.createUser(data);
        $scope.$apply();
    });

    $scope.chatClient.socket.on('remove', function (id) {
        $scope.deleteFromUsers(id);
        $scope.usersArray.splice($scope.usersArray.indexOf($scope.users[id]));
        delete $scope.users[id];
        $scope.$apply();
    });

    // variables
    $scope.title = "Lobby";
    $scope.isInPrivateChat = false;
    $scope.message = "";
    $scope.messages = "";
    $scope.globalMessages = "";
    $scope.globalChatUnread = false;
    $scope.globalChatUnreadMessages = 0;
    $scope.user = null;
    $scope.users = {};
    $scope.usersArray = [];

    //functions
    $scope.createUser = function (obj) {
        var madeUser = {
            username: obj.username,
            personalID: obj.id,
            imageURL: obj.imageURL + '?' + new Date(),
            color: ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6),
            hasUnread: false,
            unreadMessages: 0
        };
        $scope.usersArray.push(madeUser);
        return madeUser;
    };

    $scope.findUserByUsername = function (username) {
        var user;
        Object.keys($scope.users).forEach(function (id) {
            if ($scope.users[id].username === username) {
                user = $scope.users[id];
            }
        });
        return user;
    };

    $scope.rcentMessagesToZero = function () {
        $timeout(function () {
            $scope.user.recentMessages = 0;
        }, 5000);
    };

    $scope.blockUser = function () {
        $scope.user.isBlocked = true;
        $timeout(function () {
            $scope.user.isBlocked = false;
            $scope.user.recentMessages = 0;
        }, 5000);
    };

    $scope.sendMessage = function (e) {
        if (!e.shiftKey && e.keyCode === 13) {
            e.preventDefault();
        }
        if ($scope.user.isBlocked) {
            $scope.addMessage("You need to wait before you can chat again", "sm", undefined, undefined, undefined, {
                color: "#D21C1E",
                currChat: true
            });
            return;
        }
        if (e.keyCode && e.keyCode !== 13) {
            return;
        }
        var message = $scope.message.trim();

        if (message.length < 1 || message.length > 60) {
            return;
        }
        $scope.user.recentMessages++;
        if ($scope.user.recentMessages === 6) {
            $scope.blockUser();
            $scope.addMessage("You're now blocked for spamming", "sm", undefined, undefined, undefined, {
                color: "#D21C1E",
                currChat: true
            });
            return;
        } else if ($scope.user.recentMessages === 1) {
            $scope.rcentMessagesToZero();
        }
        var roomName = $scope.findRoom();
        $scope.addMessage($scope.message, "user", true, "none", roomName, {});
        $scope.chatClient.newMessage({message: $scope.message, room: roomName});
        $scope.message = "";
    };

    $scope.deleteFromUsers = function (id) {
        var username = $scope.users[id].username;
        if ($scope.user.inChatWith === username) {
            $scope.changeChatView();
            $scope.message = "";
        }
        if ($scope.user.inChatWithUsers[username]) {
            delete $scope.user.inChatWithUsers[username];
        }
    };

    $scope.changeChatView = function (username) {
        var user = $scope.findUserByUsername(username);
        var color;
        if (user) {
            color = user.color
        } else {
            color = "fff";
        }
        if (username) {
            $scope.user.inChatWith = username;
            $scope.messages = $scope.user.inChatWithUsers[username].messages;
            $scope.title = "Chatting with <span style='color:#" + color + ";'>" + username + "</span>";
            $scope.isInPrivateChat = true;
            user.hasUnread = false;
            user.unreadMessages = 0;
        } else {
            $scope.user.inChatWith = "";
            $scope.messages = $scope.globalMessages;
            $scope.title = "Lobby";
            $scope.isInPrivateChat = false;
            $scope.globalChatUnread = false;
            $scope.globalChatUnreadMessages = 0;
        }

        var chat = document.getElementById("chat");
        setTimeout(function () {
            chat.scrollTop = chat.scrollHeight;
        }, 200);
    };

    $scope.messageToGlobal = function (message) {
        $scope.globalMessages += message;
        if ($scope.user && $scope.user.inChatWith) {
            $scope.globalChatUnread = true;
            $scope.globalChatUnreadMessages++;
        }
    };

    $scope.checkForSpecialWords = function (message) {
        var urlValidRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        message = message.split(' ');
        message.forEach(function (word, index) {
            if (urlValidRegex.test(word)) {
                message[index] = '<a href="' + word + '">' + word + '</a>';
            } else if (word === ":)") {
                message[index] = "<img src='/assets/emoticons/emot_01.png' title=':)' class='emoticon' />";
            } else if (word === ":(") {
                message[index] = "<img src='/assets/emoticons/emot_02.png' title=':(' class='emoticon' />";
            } else if (word === ":P") {
                message[index] = "<img src='/assets/emoticons/emot_03.png' title=':P' class='emoticon' />";
            } else if (word === ":D") {
                message[index] = "<img src='/assets/emoticons/emot_04.png' title=':D' class='emoticon' />";
            } else if (word === ":@") {
                message[index] = "<img src='/assets/emoticons/emot_05.png' title=':@' class='emoticon' />";
            } else if (word === ":X") {
                message[index] = "<img src='/assets/emoticons/emot_06.png' title=':X' class='emoticon' />";
            }
        });
        return message.join(' ');
    };

    $scope.addMessage = function (messageBody, sender, isUser, id, isForRoom, moreInfo) {
        var date = $filter('date')(new Date(), 'HH:mm');
        var imageURL;
        var username;
        var color;
        var message;
        var isSystemMessage = (sender === 'sm') ? true : false;

        messageBody = $scope.checkForSpecialWords(messageBody);
        if (isSystemMessage) {
            color = moreInfo.color;
            message = "<p class='system-message' style='color: " + color + ";'>" + messageBody + "</p>";
        } else if (isUser) {
            imageURL = $scope.user.imageURL;
            username = $scope.user.username;
            color = "#" + $scope.user.color;

            message = "<p class='chat-user'><span class='chat-name' style='color: " + color + ";'>" + username + "</span>" +
                "<span class='chat-avatar'><img src='" + imageURL + "' alt='user avatar'></span>" +
                "<span class='chat-date'>" + date + "</span>" +
                "<span class='chat-text'>" + messageBody + "</span></p>";
        } else {
            imageURL = $scope.users[id].imageURL;
            username = $scope.users[id].username;
            color = "#" + $scope.users[id].color;

            message = "<p class='chat-other'> <span class='chat-date'>" + date + "</span>" +
                "<span class='chat-avatar'><img src='" + imageURL + "' alt='user avatar'></span>" +
                "<span class='chat-name' style='color: " + color + ";'>" + username + "</span>" +
                "<span class='chat-text'>" + messageBody + "</span></p>";
        }
        if (isSystemMessage) {
            if (moreInfo.currChat) {
                if ($scope.user.inChatWith) {
                    $scope.user.inChatWithUsers[$scope.user.inChatWith].messages += message;
                } else {
                    $scope.messageToGlobal(message);
                }
            } else {
                $scope.messageToGlobal(message);
            }
        } else if (!isForRoom) {
            $scope.messageToGlobal(message);
        } else if (!isUser) {
            $scope.user.inChatWithUsers[sender].messages += message;
            if ($scope.user.inChatWith !== sender) {
                var user = $scope.findUserByUsername(sender);
                user.hasUnread = true;
                user.unreadMessages++;
            }
        }

        if (!$scope.user.inChatWith) {
            $scope.messages = $scope.globalMessages;
        } else if (isForRoom || isUser || (moreInfo && moreInfo.currChat)) {
            if (isUser) {
                $scope.user.inChatWithUsers[$scope.user.inChatWith].messages += message;
            }
            $scope.messages = $scope.user.inChatWithUsers[$scope.user.inChatWith].messages;
        }

        var chat = document.getElementById("chat");
        setTimeout(function () {
            var scrollDiff = chat.scrollHeight - (chat.scrollTop + 490);
            if (scrollDiff >= 0 && scrollDiff <= 200) {
                chat.scrollTop = chat.scrollHeight;
            }
        }, 100);
    };

    $scope.findRoom = function () {
        var roomName1 = $scope.user.username + $scope.user.inChatWith;
        var roomName2 = $scope.user.inChatWith + $scope.user.username;
        var roomInfo = $scope.user.inChatWithUsers[$scope.user.inChatWith];
        if (roomInfo) {
            if (roomInfo.name === roomName1) {
                return roomName1
            } else if (roomInfo.name === roomName2) {
                return roomName2
            }
        }
    };

    $http.get("userInfo/user").then(function (response) {
        $scope.Client.newUserChat(response.data[0]);
    });

    $rootScope.$on("$routeChangeStart", function (e, next, current) {
        $scope.chatClient.socket.disconnect();
    });
});