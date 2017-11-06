app.controller("userController", function ($scope, $http, $controller) {
    $scope.userInfo = {
        currPass: "",
        newPass: "",
        newAvatar: ""
    };

    $scope.uploadImagePopup = function (e) {
        e.preventDefault();
        $scope.popup('Upload Avatar', 'html/includes/uploadForm.html');
    };

    $scope.submit = function (e) {
        e.preventDefault();

        var isChangingPass = false;
        var isChangingAvatar = false;

        var currPass = $scope.userInfo.currPass.trim();
        var newPass = $scope.userInfo.newPass.trim();
        var newAvatar = $scope.userInfo.newAvatar.trim();
        if (currPass.length != 0 && newPass.length != 0) {
            isChangingPass = true;
        }
        if (newAvatar.length != 0) {
            isChangingAvatar = true;
        }

        if (!isChangingPass && !isChangingAvatar) {
            $scope.messageHandle.displayMessage("hasEmptyField");
        } else {
            var dataInfo = {};
            if (isChangingPass) {
                if (!this.userSettings.newPassword.$valid ||
                    !this.userSettings.currentPassword.$valid ||
                    $scope.userInfo.currPass == $scope.userInfo.newPass) {
                    return;
                }
                dataInfo.newPass = newPass;
                dataInfo.currPass = currPass;
            }
            if (isChangingAvatar) {
                if (!this.userSettings.avatarURL.$valid) {
                    return;
                }
                dataInfo.newAvatar = newAvatar + '?' + new Date();
            }

            $http({
                method: 'POST',
                url: '/userInfo/update',
                data: dataInfo
            }).then(function successCallback(response) {
                var hasSuccseeded = response.data.hasSucceeded;
                var messeges = response.data.messages;

                messeges.forEach(function (message) {
                    message = message.message;
                    if (message === "isAvatarChanged") {
                        $scope.userData[0].avatarURL = newAvatar;
                        $scope.userInfo.newAvatar = "";
                    }
                    $scope.messageHandle.displayMessage(message);
                });

            }, function errorCallback(response) {
                console.log(response);
            });
        }
    };
});
