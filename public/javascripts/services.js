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
            return $resource(baseURL + 'deliveries/match/:id', null, {'query': {method: 'GET', isArray: true}});
        }

        function getTeams() {
            return teams;
        }

        function parseDate(inputFormat) {
            function pad(s) {
                return (s < 10) ? '0' + s : s;
            }

            var d = new Date(inputFormat);
            return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
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
            return currentHour * 4 + 1;
        }

        function getDeliveries() {
            return $resource(baseURL + 'deliveries/live');
        }

        function buildLiveMatch(match) {
            if (match.startPos < match.data.length) {
                buildMatchDetails(match, ++match.startPos, match.startPos);
            }
            else {
                match.finished = true;
            }
        }

        function whoIsBatting(match, pos) {
            if(match.data[pos].inning ===1) {
                match.team1Batting = true;
                match.team2Batting = false;
            }
            else {
                match.team2Batting = true;
                match.team1Batting = false;
            }
        }

        function buildMatchDetails(match, pos, j, flag) {
            for (var i = j; i <= pos; i++) {
                buildScore(match, i, 1);
                buildScore(match, i, 2);
                buildWickets(match, i, 1);
                buildWickets(match, i, 2);
                buildBatsmen(match, i, 1);
                buildBatsmen(match, i, 2);
                buildBowler(match, i, 1);
                buildBowler(match, i, 2);
                buildOvers(match, i, 1);
                buildOvers(match, i, 2);
                if(!flag) {
                    whoIsBatting(match, pos);
                }

            }
        }


        function Batsman(name) {
            this.name = name;
            this.runs = 0;
            this.balls = 0;
            this.onStrike = false;
            this.dismissed_by = '';
            this.dismissal_type = '';
        }

        function Bowler(name) {
            this.name = name;
            this.wickets = 0;
            this.runs = 0;
            this.balls = 0;
            this.isBowling = false;
        }

        function Team() {
            this.name = '';
            this.wickets = 0;
            this.balls = 0;
            this.batsmen = [];
            this.bowlers = [];
            this.score = 0;
        }

        function Match(index, team1, team2, timer) {
            this.index = index;
            this.data = [];
            this.startPos = 0;
            this.team1 = team1;
            this.team2 = team2;
            this.finished = false;
            this.winner = '';
            this.timer = timer;
            this.numRows = 0;
            this.matchStats = {};
            this.team1Batting = false;
            this.team2Batting = false;
        }


        function isValidBall(doc) {
            return parseInt(doc.wide_runs) === 0 && parseInt(doc.noball_runs) === 0;
        }

        function floor(value) {
            return Math.floor(value);
        }

        function getTeam(match, inning) {
            if (inning === 1) {
                return match.team1;
            } else {
                return match.team2;
            }
        }

        function ifExists(array, name) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].name === name) {
                    return i;
                }
            }
            return -1;
        }

        function buildBatsmen(match, pos, inning) {

            var team = getTeam(match, inning);
            if (parseInt(match.data[pos].inning) === inning) {
                var batsman = match.data[pos].batsman;
                var bIndex = ifExists(team.batsmen, batsman);
                findAndAddBatsman(bIndex, match.data[pos], team.batsmen);
            }
        }

        function findAndAddBatsman(bi, doc, batsmen) {
            if (bi === -1) {
                batsmen.push(new Batsman(doc.batsman));
                bi = batsmen.length - 1;
            }
            setAllBattingFalse(batsmen);
            batsmen[bi].onStrike = true;
            batsmen[bi].runs += doc.batsman_runs;
            if (isValidBall(doc)) {
                batsmen[bi].balls++;
            }
            if (doc.player_dismissed === doc.batsman) {
                batsmen[bi].dismissal_type = doc.dismissal_kind;
                batsmen[bi].dismissed_by = 'c ' + doc.fielder + ' b ' + doc.bowler;
            }
        }

        function setAllBattingFalse(group) {
            for(var i = 0; i< group.length; i++) {
                group[i].onStrike = false;
            }
        }

        function setAllBowlingFalse(group) {
            for(var i = 0; i< group.length; i++) {
                group[i].isBowling = false;
            }
        }


        function buildBowler(match, pos, inning) {
            var team = getTeam(match, inning);
            if (parseInt(match.data[pos].inning) === inning) {
                var bowler = match.data[pos].bowler;
                var bIndex = ifExists(team.bowlers, bowler);
                findAndAddBowler(bIndex, match.data[pos], team.bowlers);
            }
        }

        function findAndAddBowler(bi, doc, bowlers) {
            if (bi === -1) {
                bowlers.push(new Bowler(doc.bowler));
                bi = bowlers.length - 1;
            }
            setAllBowlingFalse(bowlers);
            bowlers[bi].isBowling = true;
            bowlers[bi].runs += doc.wide_runs;
            bowlers[bi].runs += doc.noball_runs;
            bowlers[bi].runs += doc.batsman_runs;
            if (isValidBall(doc)) {
                bowlers[bi].balls++;
            }

            if (doc.player_dismissed !== "") {
                bowlers[bi].wickets++;
            }
        }


        function buildScore(match, pos, inning) {

            var team = getTeam(match, inning);
            if (parseInt(match.data[pos].inning) === inning) {
                team.score += match.data[pos].total_runs;
            }
        }

        function buildWickets(match, pos, inning) {
            var team = getTeam(match, inning);
            if (parseInt(match.data[pos].inning, 10) === inning) {
                if (match.data[pos].player_dismissed !== "") {
                    team.wickets++;
                }
            }
        }

        function buildOvers(match, pos, inning) {
            var team = getTeam(match, inning);
            if (parseInt(match.data[pos].inning, 10) === inning) {
                if (isValidBall(match.data[pos])) {
                    team.balls++;
                }
            }
        }


        return {
            getDeliveries: getDeliveries,
            getIndexPos: getIndexPos,
            buildLiveMatch: buildLiveMatch,
            isValidBall: isValidBall,
            floor: floor,
            buildMatchDetails: buildMatchDetails,
            Match: Match,
            Team: Team
        };


    }]);
