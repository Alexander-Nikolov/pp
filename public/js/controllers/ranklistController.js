app.filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

app.controller('ranklistController', function ($scope, $http, $filter, info, $controller, $location) {
    $scope.orderByField = 'username';
    $scope.isSortReversed = false;
    $scope.nameFilter = "";
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.users = [];

    $scope.hasInfo = false;
    $scope.getData = function () {
        $scope.hasInfo = ($scope.users.length > 0) ? true : false;
        return $filter('filter')($scope.users, {username: $scope.nameFilter});
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

    $http.get("/userInfo/all").then(function (response) {
        $scope.users = response.data;
    });
    $scope.changeSortField = function (newSortField) {
        if ($scope.orderByField === newSortField) {
            $scope.isSortReversed = !$scope.isSortReversed
        } else {
            $scope.orderByField = newSortField;
            if (newSortField === 'username') {
                $scope.isSortReversed = false;
            } else {
                $scope.isSortReversed = true;
            }
        }
        $scope.currentPage = 0;
    };
});
