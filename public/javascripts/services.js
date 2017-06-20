"use strict";

angular.module('premierLeague')
    .constant('baseURL', '/')
    .factory('matchesFactory', ['$log', '$resource', 'baseURL', function ($log, $resource, baseURL) {

        var teams = ["Kolkata Knight Riders", "Royal Challengers Bangalore", "Chennai Super Kings", "Kings XI Punjab",
            "Rajasthan Royals", "Delhi Daredevils", "Mumbai Indians", "Deccan Chargers", "Kochi Tuskers Kerala",
            "Sunrisers Hyderabad", "Pune Warriors", "Gujarat Lions", "Rising Pune Supergiants"];


        function getMatches() {
            return $resource(baseURL + 'matches');
        }

        // function getSearchResults() {
        //     return $resource(baseURL + 'matches/:id');
        // }

        //returns all delivery information of a particular match
        function getDeliveries() {
            return $resource(baseURL + 'deliveries/match/:id', null, {'query':{method:'GET', isArray: true}});
        }

        function getTeams() {
            return teams;
        }

        function parseDate (inputFormat) {
            function pad(s) { return (s < 10) ? '0' + s : s; }
            var d = new Date(inputFormat);
            return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        }

        return {
            getMatches: getMatches,
            // getSearchResults: getSearchResults,
            getTeams: getTeams,
            getDeliveries: getDeliveries,
            parseDate: parseDate
        };


    }])
    .service('paginationService', ['$log', function ($log) {

        this.getPager = function (totalItems, currentPage, pageSize) {

            currentPage = currentPage || 1;

            pageSize = pageSize || 12;

            var totalPages = Math.ceil(totalItems / pageSize);
            var startPage, endPage;

            if (totalPages <= 10) {
                // less than 10 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                // more than 10 total pages so calculate start and end pages
                if (currentPage <= 6) {
                    startPage = 1;
                    endPage = 10;
                } else if (currentPage + 4 >= totalPages) {
                    startPage = totalPages - 9;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 5;
                    endPage = currentPage + 4;
                }
            }

            // calculate start and end item indexes
            var startIndex = (currentPage - 1) * pageSize;
            var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

            // create an array of pages to ng-repeat in the pager control

            var pages = (function () {
                var range = [];
                for (var i = startPage; i <= endPage; i++) {
                    range.push(i);
                }
                $log.debug(range);
                return range;
            })();

            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startPage: startPage,
                endPage: endPage,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pages
            };
        };

    }])
    .factory('simulationFactory', ['$log', '$resource', 'baseURL', function ($log, $resource, baseURL) {

        //idea: I chose to show the live feed of four matches at any given hour
        //starting from 0 to 23, the match id's will range from 1 to 96

        function getIndexPos() {
           // var range = 96;
            var d = new Date();
            var currentHour = d.getHours();  //get time in hours
            var indexPos = currentHour * 4 + 1;
            return indexPos;
        }
        function getDeliveries() {
            return $resource(baseURL + 'deliveries/live');
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

        function isValidBall(data) {
            return parseInt(data.wide_runs) === 0 && parseInt(data.noball_runs) === 0 ;
        }

        function floor(value) {
            return Math.floor(value);
        }

        function constructMessage(match, pos) {

            var msg = match.data[pos].bowler + ' is bowling. ' + match.data[pos].batsman + " on strike. ";

            if (parseInt(match.data[pos].inning) === 1) {

                if (match.data[pos].player_dismissed !== "") {
                    match.team1Wickets++;
                    msg += match.data[pos].batsman + ' is out! ';
                }

                if(isValidBall(match.data[pos])) {
                    match.team1NumBalls++;
                }

                match.team1Score += match.data[pos].total_runs;
            }
            else {
                if (match.data[pos].player_dismissed !== "") {
                    match.team2Wickets++;
                    msg += match.data[pos].batsman + ' is out! ';
                }

                if(isValidBall(match.data[pos])) {
                    match.team2NumBalls++;
                }

                match.team2Score += match.data[pos].total_runs;
            }

            msg += match.data[pos].total_runs + ' run(s)! ';


            return msg;
        }

        return {
            getDeliveries: getDeliveries,
            getIndexPos: getIndexPos,
            buildLiveMatch: buildLiveMatch,
            isValidBall: isValidBall,
            floor: floor
        };



    }]);
