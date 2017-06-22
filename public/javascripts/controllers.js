"use strict";

angular.module('premierLeague')

    .controller('HeaderController', ['$scope', '$log', 'matchesFactory', '$state', '$document', function ($scope, $log, matchesFactory, $state) {

        $scope.selected = undefined;
        $scope.teams = matchesFactory.getTeams();

        $scope.submitSelected = function () {
            var team = $scope.selected.trim();
            if ($scope.teams.indexOf(team) > -1) {
                $state.go('app.pastMatches', {team: team});
            }
        };

    }])


    .controller('HomeController', ['$scope', '$log', 'simulationFactory', 'matchesFactory', '$interval',
        function ($scope, $log, simulationFactory, matchesFactory, $interval) {

            $scope.showLoader = true;
            $scope.oneAtATime = true;

            $scope.buildImageUrl = function (name) {
                return matchesFactory.buildImageUrl(name);
            };

            $scope.isOpen = true;

            $scope.floor = function (value) {
                return simulationFactory.floor(value);
            };

            var ind = simulationFactory.getIndexPos();
            var indices = [ind, ind + 1, ind + 2, ind + 3];

            var Match = simulationFactory.Match;
            var Team = simulationFactory.Team;


            $scope.matches = [];
            $scope.matches.push(new Match(0, new Team(), new Team(), 4000));
            $scope.matches.push(new Match(1, new Team(), new Team(), 7500));
            $scope.matches.push(new Match(2, new Team(), new Team(), 6500));
            $scope.matches.push(new Match(3, new Team(), new Team(), 4500));

            $scope.fixToTwo = function (num, denom) {
                return denom > 0 ? (num / denom * 100).toFixed(2) : 0;
            };

            $scope.calcEcon = function (runs, balls) {
                return (runs / (balls / 6)).toFixed(2);
            };

            simulationFactory.getDeliveries().query({first: ind})
                .$promise.then(
                function (response) {

                    for (var i = 0; i < response.length; i++) {

                        if (parseInt(response[i].match_id) === indices[0]) {
                            $scope.matches[0].data.push(response[i]);
                        }
                        else if (parseInt(response[i].match_id) === indices[1]) {
                            $scope.matches[1].data.push(response[i]);
                        }
                        else if (parseInt(response[i].match_id) === indices[2]) {
                            $scope.matches[2].data.push(response[i]);
                        }
                        else if (parseInt(response[i].match_id) === indices[3]) {
                            $scope.matches[3].data.push(response[i]);
                        }
                    }

                    var matchStats = response[response.length - 1];
                    for (var l = 0; l < 4; l++) {
                        var statsId = parseInt(matchStats[l].id);
                        var indicesId = indices.indexOf(statsId);
                        if (indicesId > -1) {
                            $scope.matches[indicesId].matchStats = matchStats[l];
                        }
                    }

                    $log.debug($scope.matches);

                    for (var j = 0; j < 4; j++) {
                        initializeSimulation($scope.matches[j]);
                    }
                    for (var k = 0; k < 4; k++) {
                        startSimulation($scope.matches[k].timer, $scope.matches[k]);
                    }

                    $scope.showLoader = false;

                },
                function (response) {
                    $scope.message = response;
                    $log.debug(response);
                });

            function initializeSimulation(match) {

                var d = new Date();
                match.numRows = match.data.length;
                match.startPos = Math.floor((match.numRows) / (match.index + 2)) + d.getMinutes();
                var sPos = match.startPos;
                if (sPos >= match.numRows) {
                    sPos = match.numRows - 10;
                }
                match.team1.name = match.matchStats.team1;
                match.team2.name = match.matchStats.team2;
                $log.debug(match.startPos);
                simulationFactory.buildMatchDetails(match, sPos, 0);
                $log.debug(match.team1.batsmen);
            }


            function startSimulation(timer, match) {
                $interval(function () {
                    simulationFactory.buildLiveMatch(match);
                }, timer);
            }


        }])

    .controller('PastMatchesController', ['$scope', 'matchesFactory', '$log', '$stateParams', '$state', 'paginationService',
        function ($scope, matchesFactory, $log, $stateParams, $state, paginationService) {

            $scope.showLoader = false;
            $scope.hasAlert = false;
            $scope.alertMessage = '';

            $scope.teams = matchesFactory.getTeams();

            $scope.team1Selected = '';
            $scope.team2Selected = '';
            $scope.seasonSelected = '';

            $scope.matchesList = [];
            $scope.currentMatches = [];

            $scope.seasons = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];

            $scope.changed = false;

            $scope.changeFunc = function () {
                $scope.changed = true;
                $scope.hasAlert = false;
                $scope.alertMessage = '';
            };

            $scope.parseDate = function (input) {
                return matchesFactory.parseDate(input);
            };

            $scope.buildImageUrl = function (name) {
                return matchesFactory.buildImageUrl(name);
            };

            $scope.submitSelected = function () {

                if ($scope.changed) {

                    var queryObj = {};
                    if ($scope.seasonSelected) {
                        queryObj.season = $scope.seasonSelected;
                    }
                    if ($scope.team1Selected) {
                        $log.debug($scope.team1Selected);
                        queryObj.team1 = $scope.team1Selected;
                    }
                    if ($scope.team2Selected) {
                        queryObj.team2 = $scope.team2Selected;
                        if ($scope.team1Selected === $scope.team2Selected) {
                            $scope.alertMessage = 'How can a same team play against itself? Doofus!';
                            $scope.hasAlert = true;
                            return;
                        }
                    }
                    $scope.showLoader = true;
                    $log.debug(queryObj);
                    matchesFactory.getMatches().query(queryObj)
                        .$promise.then(function (response) {
                        $log.info('query successful');
                        $log.debug(response);
                        if (response.length === 0) {
                            $scope.alertMessage = 'No matches exist for the provided criteria!';
                            $scope.hasAlert = true;
                        }
                        $scope.showLoader = false;
                        $scope.matchesList = response;
                        $log.debug("matchesList: ", $scope.matchesList);
                        $scope.changed = false;
                        $scope.initPager();

                    }, function (response) {
                        $log.debug('Error processing query: ', response);
                        $scope.alertMessage = 'Error processing query. Try again!';
                        $scope.hasAlert = false;
                    });
                }

            };


            $scope.pager = {};
            $scope.showPagination = false;


            $scope.initPager = function () {
                $scope.setPage(1);
                $scope.showPagination = true;
            };

            $scope.setPage = function (page) {
                if (page < 1 || page > $scope.pager.totalPages) {
                    return;
                }

                $scope.pager = paginationService.getPager($scope.matchesList.length, page);
                $scope.currentMatches = $scope.matchesList.slice($scope.pager.startIndex, $scope.pager.endIndex + 1);
            };

            function init() {
                if ($scope.teams.indexOf($state.params.team) > -1) {
                    $scope.team1Selected = $state.params.team;
                }
                else {
                    $scope.seasonSelected = 2008;
                }
                $scope.changeFunc();
                $scope.submitSelected();
            }

            init();


        }])

    .controller('MatchDetailsController', ['$scope', '$log', 'matchesFactory', 'simulationFactory', '$stateParams', '$cookies', '$state',
        function ($scope, $log, matchesFactory, simulationFactory, $stateParams, $cookies, $state) {

            $scope.showLoader = true;

            var Match = simulationFactory.Match;
            var Team = simulationFactory.Team;

            $scope.match = new Match(0, new Team(), new Team(), 0);

            $scope.buildImageUrl= function(name) {
                return matchesFactory.buildImageUrl(name);
            };

            $scope.floor = function(value) {
                return simulationFactory.floor(value);
            };

            $scope.fixToTwo = function (num, denom) {
                return denom > 0 ? (num / denom * 100).toFixed(2) : 0;
            };

            $scope.calcEcon = function (runs, balls) {
                return (runs / (balls / 6)).toFixed(2);
            };


            var pos = $stateParams.pos;

            function getter() {
                matchesFactory.getMatchDetails()
                    .query({id: $stateParams.mid})
                    .$promise.then(function (response) {

                    $scope.match.data = response;
                    pos = pos === 0 ? response.length - 1 : pos;
                    console.log("pos:" + pos);
                    simulationFactory.buildMatchDetails($scope.match, pos, 0, true);

                    $scope.match.team1.name = $scope.match.matchStats.team1;
                    $scope.match.team2.name = $scope.match.matchStats.team2;

                    $scope.showLoader = false;

                }, function (response) {
                    $log.debug(response);
                });
            }

            function init() {

                $log.debug($stateParams);
                if ($stateParams.matchStats === null) {
                    if ($cookies.getObject($stateParams.mid) === undefined) {
                        $state.go('app.pastMatches');
                    }
                    else {
                        $scope.match.matchStats = $cookies.getObject($stateParams.mid);
                        getter();
                    }
                }
                else {
                    $scope.match.matchStats = $stateParams.matchStats;
                    $cookies.putObject($stateParams.mid, $scope.match.matchStats);
                    $log.debug('getObject: ', $cookies.getObject($stateParams.mid));
                    getter();
                }
            }

            init();

        }])
;
