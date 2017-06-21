"use strict";

angular.module('premierLeague')

    .controller('HomeController', ['$scope', '$log', 'simulationFactory', '$interval', function ($scope, $log, simulationFactory, $interval) {
        
        $scope.showLoader = true;
        $scope.oneAtATime = true;

        $scope.buildImageUrl = function(name) {
            return '/images/'+String(name).replace(/\s+/g, '-') + '.png';
        };

        $scope.floor = function(value) {
            return simulationFactory.floor(value);
        };

        var ind = simulationFactory.getIndexPos();
        var indices = [ind, ind + 1, ind + 2, ind + 3];

        var Match = simulationFactory.Match;
        var Team = simulationFactory.Team;


        $scope.matches = [];
        $scope.matches.push(new Match(0, new Team(), new Team(), 4000));
        $scope.matches.push(new Match(0, new Team(), new Team(), 7500));
        $scope.matches.push(new Match(0, new Team(), new Team(), 6500));
        $scope.matches.push(new Match(0, new Team(), new Team(), 4500));


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

                var matchStats = response[response.length-1];
                for(var l = 0; l< 4; l++) {
                    var statsId = parseInt(matchStats[l].id);
                    var indsId = inds.indexOf(statsId);
                    if(indsId > -1) {
                        $scope.matches[indsId].matchStats = matchStats[l];
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
            match.startPos = Math.floor((match.numRows) / (match.index + 1)) + d.getMinutes();
            var sPos = match.startPos;
            if (sPos >= match.numRows) {
                sPos = match.numRows - 10;
            }
            simulationFactory.buildMatchDetails(match, sPos, 0);
        }



        function startSimulation(timer, match) {
            $interval(function () {
                simulationFactory.buildLiveMatch(match);
            }, timer);
        }


    }])

;
