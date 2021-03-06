const app = angular.module('crowdbotics', ['ngRoute', 'ngSanitize', 'ngCookies']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    ($routeProvider, $locationProvider, $httpProvider) => {
        $routeProvider
            .when('/', {
                templateUrl: '../views/main.html',
                controller: 'homeCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
        $httpProvider.interceptors.push(['$q', '$location', '$cookies', '$rootScope',
            ($q, $location, $cookies, $rootScope) => {
            return {
                request: config => {
                    config.headers = config.headers || {};
                    config.timeout = 15000;
                    let token = $cookies.get('token');
                    if (token) {
                        config.headers.Authorization = token;
                    }
                    return config;
                },
                responseError: response => {
                    switch (response.status) {
                        case 401:
                        case 403:
                            $rootScope.isLoggedIn = false;
                            $cookies.remove('token');
                            break;
                        case 408 :
                        case -1 :
                            break;
                        default:
                            break;
                    }
                    return $q.reject(response);
                }
            };
        }]);
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
]);

app.run(['$rootScope', '$timeout', '$http', '$cookies',
    ($rootScope, $timeout, $http, $cookies) => {
        $rootScope.$on('$routeChangeStart', () => {
            if (!$cookies.get('token')) $rootScope.isLogged = false;
        });
        $rootScope.httpRequest = (path, method, obj, callback) => {
            return $http({
                url: `/api/${path}`,
                method,
                data: obj
            }).success(callback).error(callback);
        };
        $rootScope.getUserInfo = callback => {
            const token = $cookies.get('token');
            $http({
                method: 'GET',
                timeout: 15000,
                url: '/api/userInfo',
                headers: {
                    Authorization: token
                }
            }).success(callback).error(callback);
        };
    }
]);
