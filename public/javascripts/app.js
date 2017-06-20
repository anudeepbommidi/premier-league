"use strict";

angular.module('premierLeague', ['ngAnimate', 'ui.bootstrap','ui.router', 'ngResource'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $logProvider) {

            $locationProvider.hashPrefix('');
            $logProvider.debugEnabled(false);

            $stateProvider
                .state('app', {
                    url: '/',
                    views: {
                        'header': {
                            templateUrl: 'templates/header.html',
                            controller: 'HeaderController'
                        },
                        'content': {
                            templateUrl: 'templates/home.html',
                            controller: 'HomeController'
                        },
                        'footer': {
                            templateUrl: 'templates/footer.html'
                        }
                    }
                })
                .state('app.pastMatches', {
                    url: 'past-matches',
                    views: {
                        'content@': {
                            templateUrl: 'templates/past-matches.html',
                            controller: 'PastMatchesController'
                        }
                    },
                    params: {
                        team: null
                    }
                });

            $urlRouterProvider.otherwise('/');
        }])

;

