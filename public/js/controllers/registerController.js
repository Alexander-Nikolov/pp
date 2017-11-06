app.controller('registerController', function ($scope, $http, $controller, $location) {
    $scope.userInfo = {
        name: '',
        email: '',
        username: '',
        password: '',
        confirm: ''
    };

    $scope.submit = function (e) {
        e.preventDefault();

        var name = $scope.userInfo.name.trim();
        var email = $scope.userInfo.email.trim();
        var username = $scope.userInfo.username.trim();
        var password = $scope.userInfo.password.trim();
        var confirm = $scope.userInfo.confirm.trim();

        if (name.length == 0 || email.length == 0 ||
            username.length == 0 || password.length == 0 ||
            confirm.length == 0) {
            $scope.messageHandle.displayMessage("hasEmptyField");
        } else {
            if ($scope.registerForm.$valid) {
                $http({
                    method: 'POST',
                    url: '/registration',
                    data: {
                        name: name,
                        email: email,
                        username: username,
                        password: password,
                        confirm: confirm
                    }
                }).then(function successCallback(response) {
                    var errors = response.data.errors;
                    if (errors && Array.isArray(errors)) {
                        errors.forEach(function (error) {
                            $scope.messageHandle.displayMessage(error);
                        });
                    } else {
                        $location.path("/home");
                    }

                }, function errorCallback(response) {
                    console.log(response);
                });
            }
        }
    };
});
