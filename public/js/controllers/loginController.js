app.controller('loginController', function ($scope, $http, $controller, $location) {
    $scope.userInfo = {
        username: '',
        password: ''
    };

    $scope.submit = function (e) {
        e.preventDefault();

        var username = $scope.userInfo.username.trim();
        var password = $scope.userInfo.password.trim();

        if (username.length == 0 || password.length == 0) {
            $scope.messageHandle.displayMessage("hasEmptyField");
        } else {
            if ($scope.loginForm.$valid) {
                $http({
                    method: 'POST',
                    url: '/login',
                    data: {
                        username: username,
                        password: password
                    }
                }).then(function successCallback(response) {
                    var hasSuccseeded = response.data.hasSuccseeded;
                    if (!hasSuccseeded) {
                        $scope.messageHandle.displayMessage("hasServerError");
                    } else {
                        $location.path('/home');
                    }
                }, function errorCallback(response) {
                    console.log(response);
                });
            }
        }
    };
});
