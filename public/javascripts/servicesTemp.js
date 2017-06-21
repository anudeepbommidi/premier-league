"use strict";

angular.module('premierLeague')
    .constant('baseURL', '/')
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
            buildMatchDetails(match, ++match.startPos, match.startPos);
        }

        function buildMatchDetails(match, pos, j) {
            for (var i = j; i <= pos; i++) {
                buildScore(match.data, i, 1);
                buildScore(match.data, i, 2);
                buildWickets(match.data, i, 1);
                buildWickets(match.data, i, 2);
                buildBatsmen(match, i, 1);
                buildBatsmen(match, i, 2);
                buildBowler(match, i, 1);
                buildBowler(match, i, 2);
                buildOvers(match.data, i, 1);
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
            this.bowling = false;
        }

        function Team() {
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
        }


        function isValidBall(doc) {
            return parseInt(doc.wide_runs) === 0 && parseInt(doc.noball_runs) === 0;
        }

        function floor(value) {
            return Math.floor(value);
        }


        function buildBatsmen(match, pos, inning) {
            var team = 'team' + inning;
            var batsman = match.data[pos].batsman;
            var nonStriker = match.data[pos].non_striker;
            var bIndex = match.team.batsmen.indexOf(batsman);
            var nSIndex = match.team.batsmen.indexOf(nonStriker);
            findAndAddBatsman(bIndex, match.data[pos], match.team.batsmen, true);
            findAndAddBatsman(nSIndex, match.data[pos], match.team.batsmen, false);
        }

        function findAndAddBatsman(bi, doc, batsmen, on_strike) {
            if (bi === -1) {
                batsmen.push(new Batsman(doc.batsman));
                bi = batsmen.length - 1;
            }
            if (on_strike) {
                batsmen[bi].runs += doc.batsman_runs;
                if(isValidBall(doc)) {
                    batsmen[bi].balls++;
                }
            }
            if (doc.player_dismissed === doc.batsman) {
                batsmen[bi].dismssal_type = doc.dismissal_kind;
                batsmen[bi].dismissed_by = 'c ' +doc.fielder +' b ' + doc.bowler;
            }
        }

        function buildBowler(match, pos, inning) {
            var team = 'team' + inning;
            var bowler = match.data[pos].bowler;
            var bIndex = match.team.bowlers.indexOf(bowler);
            findAndAddBowler(bIndex, match.data[pos], match.team.bowlers);
        }

        function findAndAddBowler(bi, doc, bowlers) {
            if (bi === -1) {
                bowlers.push(new Bowler(doc.bowler));
                bi = bowlers.length - 1;
            }

            bowlers[bi].runs += doc.wide_runs;
            bowlers[bi].runs += doc.noball_runs;
            bowlers[bi].runs += doc.batsman_runs;

            if (doc.player_dismissed !== "") {
                bowlers[bi].wickets++;
            }
        }


        function buildScore(data, inning, pos) {
            var score = 0;
            for (var i = 0; i < pos; i++) {
                if (parseInt(data[i].inning) === inning) {
                    score += data[i].total_runs;
                }

            }
            return score;
        }

        function buildWickets(data, inning, pos) {
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

        function buildOvers(data, inning, pos) {
            var balls = 0;
            for (var i = 0; i < pos; i++) {
                if (parseInt(data[i].inning) === inning) {
                    if (simulationFactory.isValidBall(data[i])) {
                        balls += 1;
                    }
                }
            }
            return balls;
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
