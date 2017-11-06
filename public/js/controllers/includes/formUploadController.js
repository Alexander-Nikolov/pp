app.controller('formUploadController', function ($scope, $timeout) {
    $scope.showUploadError = false;
    $scope.isLoading = false;
    $scope.uploadme = {};
    $scope.uploadme.src = '';

    $scope.uploadImg = function (e) {
        e.preventDefault();
        if (imageUpload[1].files[0] && imageUpload[1].files[0].size <= 100000) {
            $scope.isLoading = true;
            var FD = new FormData(imageUpload[0]);
            var XHR = new XMLHttpRequest();
            XHR.open("POST", "/upload");
            XHR.send(FD);
            XHR.onreadystatechange = function () {
                if(XHR.readyState === XMLHttpRequest.DONE) {
                    $scope.uploadme.src = "";
                    imageUpload[0].reset();
                    $scope.isLoading = false;
                    $scope.userData[0].avatarURL = JSON.parse(XHR.responseText).url + '?' + new Date();
                    $scope.$apply();
                }
            };
        } else {
            $scope.showUploadError = true;
            $timeout(function () {
                $scope.showUploadError = false;
            }, 2000)
        }
    };

    $scope.cancelUpload = function (e) {
        e.preventDefault();
        imageUpload[0].reset();
        $scope.uploadme.src = "";
    }
});