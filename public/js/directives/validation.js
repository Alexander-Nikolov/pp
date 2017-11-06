app.directive('nameValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            function validate(value) {
                var nameRegexp = /^[a-zA-Z ]+$/;
                if (!nameRegexp.test(value)) {
                    mCtrl.$setValidity('name', false);
                } else {
                    mCtrl.$setValidity('name', true);
                }
                return value;
            }

            mCtrl.$parsers.push(validate);
        }
    };
});

app.directive('emailValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            function validate(value) {
                var emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!emailRegexp.test(value)) {
                    mCtrl.$setValidity('email', false);
                } else {
                    mCtrl.$setValidity('email', true);
                }
                return value;
            }

            mCtrl.$parsers.push(validate);
        }
    };
});

app.directive('usernameValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            function validate(value) {
                if (value.length < 4 || value.length > 15) {
                    mCtrl.$setValidity('username', false);
                } else {
                    mCtrl.$setValidity('username', true);
                }
                return value;
            }

            mCtrl.$parsers.push(validate);
        }
    };
});

app.directive('passwordValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            function validate(value) {
                if (value.length < 7) {
                    mCtrl.$setValidity('password', false);
                } else {
                    mCtrl.$setValidity('password', true);
                }
                return value;
            }

            mCtrl.$parsers.push(validate);
        }
    };
});

app.directive('urlValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            var urlValidRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

            function validate(value) {
                if (!urlValidRegex.test(value)) {
                    mCtrl.$setValidity('url', false);
                } else {
                    mCtrl.$setValidity('url', true);
                }
                return value;
            }

            mCtrl.$parsers.push(validate);
        }
    };
});
