app.controller("messageController", function ($scope, $filter, $http, info) {

    $scope.getMessages = function () {
        $http.get("userInfo/user").then(function (response) {
            $scope.messages = response.data[0].inboxMessages;
            $scope.user = response.data[0];
        });
    };

    $scope.inboxFilter = "";
    $scope.inboxOrderBy = "-date";
    $scope.isSortReversed = false;
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.messages = [];

    $scope.hasInfo = false;
    $scope.getData = function () {
        $scope.hasInfo = ($scope.messages.length > 0) ? true : false;
        return $filter('filter')($scope.messages, $scope.inboxFilter);
    };

    $scope.numberOfPages = function () {
        var number = Math.ceil($scope.getData().length / $scope.pageSize);
        if ($scope.currentPage > number - 1) {
            $scope.currentPage = number - 1;
        }
        if (number === 0) {
            number = 1;
            $scope.currentPage = 0;
        }
        return number;
    };

    $scope.getMessages();

    $scope.changeSortField = function (newSortField) {
        if ($scope.inboxOrderBy === newSortField) {
            $scope.isSortReversed = !$scope.isSortReversed
        } else {
            $scope.inboxOrderBy = newSortField;
            $scope.isSortReversed = false;
        }
        $scope.currentPage = 0;
    };


    if (info.isSendingMessage) {
        $scope.buttonText = "Back";
        $scope.view = "send message";
    } else {
        $scope.buttonText = "Send Message";
        $scope.view = "inbox";
    }
    $scope.changeView = function () {
        if ($scope.view === "inbox") {
            $scope.view = "send message";
            $scope.buttonText = "Back";
        } else {
            $scope.getMessages();
            $scope.view = "inbox";
            $scope.buttonText = "Send Message";
        }
    };

    // Delete message
    $scope.deleteMessage = function (message) {
        $http({
            method: 'POST',
            url: '/userToUserMessage/delete',
            data: {
                user: $scope.user,
                message: message
            }
        });
        $scope.messages.splice($scope.messages.indexOf(message), 1);
    };

    //Show message
    $scope.userInboxMessage = {
        message: "",
        subject: "",
        sender: ""
    };
    $scope.showMessage = function (message) {
        var index = $scope.messages.indexOf(message);
        $scope.view = "show message";
        $scope.buttonText = "Back";
        $scope.userInboxMessage.message = $scope.messages[index].messageBody;
        $scope.userInboxMessage.subject = $scope.messages[index].subject;
        $scope.userInboxMessage.sender = $scope.messages[index].sender;
    };

    //Send message
    $scope.isChangingUser = false;
    $scope.changeUser = function () {
        if (!$scope.isChangingUser) {
            $scope.messageTo = "";
        } else if ($scope.messageTo === "") {
            $scope.messageTo = "Send to...";
        }
        $scope.isChangingUser = !$scope.isChangingUser;

        setTimeout(function () {
            document.querySelector('#message-username input').focus();
        }, 100);
    };

    $scope.messageTo = info.messageTo || "Send to...";
    $scope.subject = "";
    $scope.message = "";

    $scope.reply = function (username, subject) {
        $scope.messageTo = username;
        $scope.subject = "Re: " + subject;
        $scope.view = "send message";
    };

    $scope.send = function (e) {
        e.preventDefault();

        var subject = $scope.subject.trim();
        var messageTo = $scope.messageTo.trim();
        var message = $scope.message.trim();
        if (message.length === 0 ||
            !$scope.sendMessage.name.$valid ||
            $scope.messageTo.length === 0 ||
            $scope.messageTo === "Send to...") {
            $scope.messageHandle.displayMessage("hasEmptyField");
        } else {

            $http({
                method: 'POST',
                url: '/userToUserMessage',
                data: {
                    receiver: messageTo,
                    subject: subject,
                    message: message
                }
            }).then(function successCallback(response) {
                var messages = response.data.messages;
                var hasSuccseeded = response.data.hasSuccseeded;
                $scope.subject = "";
                $scope.message = "";
                messages.forEach(function (message) {
                    message = message.message;
                    $scope.messageHandle.displayMessage(message);
                });
            }, function errorCallback(response) {
                console.log(response);
            });
        }
    };
});
