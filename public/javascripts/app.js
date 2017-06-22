"use strict";

angular.module('premierLeague', ['ngAnimate', 'ui.bootstrap','ui.router', 'ngResource', 'ngCookies'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $logProvider) {

            $locationProvider.hashPrefix('');
            $logProvider.debugEnabled(true);

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
                })
                .state('app.matchDetails', {
                    url: 'match-details/:mid',
                    views: {
                        'content@': {
                            templateUrl: 'templates/match-details.html',
                            controller: 'MatchDetailsController'
                        }
                    },
                    params: {
                        matchStats: null,
                        pos: 0
                    }
                });

            $urlRouterProvider.otherwise('/');
        }])

;

