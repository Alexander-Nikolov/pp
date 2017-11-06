var app = angular.module("myApp", ["ngRoute", "ngAnimate", "ngSanitize"]);

app.factory("isUserAllowed", function ($http, $location, $route) {
    return function (route) {
        $http({
            method: 'GET',
            url: '/userInfo'
        }).then(function successCallback(response) {
            var isLogged;
            if (!response.data) {
                isLogged = false;
            } else {
                isLogged = true;
            }
            if (route !== "otherwise" && isLogged === $route.routes[route].reqLogin) {
                $location.path(route);
                return isLogged;
            } else {
                if (isLogged) {
                    $location.path("/home");
                } else {
                    $location.path("/login");
                }
                return isLogged;
            }
        }, function errorCallback(response) {
            console.log(response);
        });
    }
});

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/login", {
            templateUrl: "/html/templates/login.html",
            reqLogin: false,
            controller: "loginController",
            resolve: {
                allowed: function (isUserAllowed) {
                    isUserAllowed("/login");
                }
            }
        })
        .when("/register", {
            templateUrl: "/html/templates/register.html",
            reqLogin: false,
            controller: "registerController",
            resolve: {
                allowed: function (isUserAllowed) {
                    isUserAllowed("/register");
                }
            }
        })
        .when("/home", {
            templateUrl: "/html/templates/home.html",
            reqLogin: true,
            controller: "homeController",
            resolve: {
                allowed: function (isUserAllowed) {
                    isUserAllowed("/home");
                }
            }
        })
        .when("/settings", {
            templateUrl: "/html/templates/accSettings.html",
            reqLogin: true,
            controller: "userController",
            resolve: {
                allowed: function (isUserAllowed) {
                    isUserAllowed("/settings");
                }
            }
        })

        .when("/ranklist", {
            templateUrl: "/html/templates/ranklist.html",
            reqLogin: true,
            controller: "ranklistController",
            resolve: {
                allowed: function (isUserAllowed) {
                    isUserAllowed("/ranklist");
                }
            }
        })
        .when("/messages", {
            templateUrl: "/html/templates/message.html",
            reqLogin: true,
            controller: "messageController",
            resolve: {
                allowed: function (isUserAllowed) {
                    isUserAllowed("/messages");
                }
            }
        })
        .otherwise({
            resolve: {
                allowed: function (isUserAllowed) {
                    isUserAllowed("otherwise");
                }
            }
        });
    $locationProvider.html5Mode(true);
});

app.factory("info", function () {
    return {};
});

app.controller('rootController', function ($scope, $rootScope, $http, $location, isUserAllowed, $route, $sce, info) {
    //socket Client
    $scope.Client = {};
    $scope.Client.socket = io.connect();

    $scope.isLoading = true;
    $scope.isUiVisible = true;

    $scope.background = {
        "background-image": "none"
    };

    // Sound
    var audio = document.getElementById("audio");

    $scope.audioControl = function (adjustment) {
        if (adjustment === "volumeUp") {
            if (audio.volume < 1) {
                audio.volume += 0.2;
            }
        }
        if (adjustment === "volumeDown") {
            if (audio.volume > 0.2) {
                audio.volume -= 0.2;
            }
        }
        if (adjustment === "stop") {
            audio.volume = 0;
        }
    };

    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.logout = function (e) {
        e.preventDefault();
        $http({
            method: 'GET',
            url: '/logout'
        }).then(function successCallback(response) {
            $location.path("/login");
        }, function errorCallback(response) {
            console.log(response);
        });
    };

    $scope.messageHandle = {
        messages: {
            hasEmptyField: false,
            hasServerError: false,
            isUsernameTaken: false,
            isEmailTaken: false,
            invalidData: false,
            isCurrentPassValid: false,
            isPassChanged: false,
            isAvatarChanged: false,
            isUserExisting: false,
            hasMessageSent: false
        },
        displayMessage: function (messageName) {
            if ($scope.messageHandle.messages[messageName]) {
                return;
            }

            $scope.messageHandle.messages[messageName] = true;
            $scope.messageHandle.hideMessage(messageName);
        },

        hideMessage: function (messageName) {
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.messageHandle.messages[messageName] = false;
                });
            }, 2500);
        }
    };

    $scope.sendMessageToPlayer = function (username) {
        info.messageTo = username;
        info.isSendingMessage = true;
        $location.path("/messages")
    };

    $scope.userData = [null];
    $scope.getLoggedUser = function () {
        $http.get("userInfo/user").then(function (response) {
            $scope.userData[0] = response.data[0];
            if ($scope.userData[0]) {
                $scope.userData[0].avatarURL += '?' + new Date();
            }
        });
    };

    $scope.trustAsHtml = function (string) {
        return $sce.trustAsHtml(string);
    };

    //popup
    $scope.popupTitle = '';
    $scope.hasPopup = false;
    $scope.styleForPopup = null;
    $scope.classForPopup = "";
    $scope.popupIncludeUrl = '';

    $scope.popup = function (title, html, style, className) {
        $scope.popupTitle = title;
        $scope.popupIncludeUrl = html;
        $scope.styleForPopup = style;
        $scope.classForPopup = className;
        $scope.hasPopup = true;
    };

    $scope.closePopup = function () {
        $scope.hasPopup = false;
    };

    $rootScope.$on("$routeChangeStart", function (e, next, current) {
        Object.keys($scope.messageHandle.messages).forEach(function (message) {
            $scope.messageHandle.messages[message] = false;
        });
        $scope.background["background-image"] = "none";
        $scope.isLoading = true;
        $scope.isUiVisible = false;
    });

    $rootScope.$on("$routeChangeSuccess", function (e, next, current) {
        var route = $location.path();
        if (route !== "/messages") {
            info.messageTo = "";
            info.isSendingMessage = "";
        }

        if ($route.routes[route].reqLogin) {
            $scope.background["background-image"] = "url('assets/space3.jpg')";
            $scope.isUiVisible = true;
        } else {
            $scope.background["background-image"] = "none";
            $scope.isUiVisible = false;
        }
        $scope.isLoading = false;
        $scope.getLoggedUser();
    });
});
