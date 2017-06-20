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
    .controller('HomeController', ['$scope', '$log', 'simulationFactory', '$interval', function ($scope, $log, simulationFactory, $interval, $document) {

        var ind = simulationFactory.getIndexPos();
        var inds = [ind, ind + 1, ind + 2, ind + 3];

        $scope.matches = [{}, {}, {}, {}];

        $scope.showLoader = true;


        $scope.oneAtATime = true;

        $scope.buildImageUrl = function(name) {
            return '/images/'+String(name).replace(/\s+/g, '-') + '.png';
        };


        setupMatches($scope.matches[0], 2000, 0);
        setupMatches($scope.matches[1], 5000, 1);
        setupMatches($scope.matches[2], 3000, 2);
        setupMatches($scope.matches[3], 6000, 3);


        function setupMatches(match, timer, ind) {
            match.index = ind;
            match.data = [];
            match.numRows = 0;
            match.startPos = 0;
            match.team1Score = 0;
            match.team2Score = 0;
            match.team1Wickets = 0;
            match.team2Wickets = 0;
            match.liveMessages = ['', '', '', '', ''];
            match.lmindex = 0; //live message index
            match.won = false;
            match.winner = '';
            match.timer = timer;

        }


        simulationFactory.getDeliveries().query({first: ind})
            .$promise.then(
            function (response) {
                $scope.liveMatches = response;

                for (var i = 0; i < response.length; i++) {

                    if (parseInt(response[i].match_id) === inds[0]) {
                        $scope.matches[0].data.push(response[i]);
                    }
                    else if (parseInt(response[i].match_id) === inds[1]) {
                        $scope.matches[1].data.push(response[i]);
                    }
                    else if (parseInt(response[i].match_id) === inds[2]) {
                        $scope.matches[2].data.push(response[i]);
                    }
                    else if (parseInt(response[i].match_id) === inds[3]) {
                        $scope.matches[3].data.push(response[i]);
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
            });

        function initializeSimulation(match) {

            var d = new Date();
            match.numRows = match.data.length;
            match.startPos = Math.floor((match.numRows) / (match.index + 1)) + d.getMinutes();
            var sPos = match.startPos;
            if (sPos >= match.numRows) {
                sPos = match.numRows - 10;
            }
            $log.debug(sPos);
            match.team1Score = getCurrentScore(match.data, 1, sPos);
            match.team2Score = getCurrentScore(match.data, 2, sPos);
            match.team1Wickets = getCurrentWickets(match.data, 1, sPos);
            match.team2Wickets = getCurrentWickets(match.data, 2, sPos);
            match.battingTeam = match.data[sPos].batting_team;
            match.bowlingTeam = match.data[sPos].bowling_team;
            for(var l = 0; l<5; l++) {
                buildLiveMatch(match);
            }

        }

        function getCurrentScore(data, inning, pos) {
            var score = 0;
            for (var i = 0; i < pos; i++) {
                if (parseInt(data[i].inning) === inning) {
                    score += data[i].total_runs;
                }

            }
            return score;
        }

        function getCurrentWickets(data, inning, pos) {
            var wickets = 0;
            for (var i = 0; i < pos; i++) {
                if (parseInt(data[i].inning) === inning) {
                    if (data[i].player_dismissed !== "") {
                        wickets++;
                    }
                }
            }
            return wickets;
        }

        function startSimulation(timer, match) {
            $interval(function () {
                buildLiveMatch(match);
            }, timer);
        }

        function buildLiveMatch(match) {

            if (match.startPos < match.numRows) {
                if (match.liveMessages.length >= 5) {
                    match.liveMessages.pop();
                }
                match.liveMessages.unshift(constructMessage(match, match.startPos));
                match.battingTeam = match.data[match.startPos].batting_team;
                match.bowlingTeam = match.data[match.startPos].bowling_team;
                match.startPos++;
                match.lmindex++;
            }
            else {
                if (match.team1Score > match.team2Score) {
                    match.winner = match.battingTeam;
                }
                else {
                    match.winner = match.bowlingTeam;
                }
                match.won = true;
            }

        }

        function constructMessage(match, pos) {

            var msg = match.data[pos].bowler + ' is bowling. ' + match.data[pos].batsman + " on strike. ";

            if (parseInt(match.data[pos].inning) === 1) {

                if (match.data[pos].player_dismissed !== "") {
                    match.team1Wickets++;
                    msg += match.data[pos].batsman + ' is out! ';
                }

                match.team1Score += match.data[pos].total_runs;
            }
            else {
                if (match.data[pos].player_dismissed !== "") {
                    match.team2Wickets++;
                    msg += match.data[pos].batsman + ' is out! ';
                }
                match.team2Score += match.data[pos].total_runs;
            }

            msg += match.data[pos].total_runs + ' run(s)! ';


            return msg;
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

            $scope.team2 = [];
            $scope.matchesList = [];

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

            $scope.submitSelected = function () {

                if ($scope.changed) {

                    var queryObj = {};
                    if ($scope.seasonSelected !== "") {
                        queryObj.season = $scope.seasonSelected;
                    }
                    if ($scope.team1Selected !== "") {
                        $log.debug($scope.team1Selected);
                        queryObj.team1 = $scope.team1Selected;
                    }
                    if ($scope.team2Selected !== "") {
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
;
