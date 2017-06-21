var express = require('express'),
    matchRouter = express.Router(),
    Matches = require('../models/match');


matchRouter.route('/')
    .get(function (req, res, next) {

        var multipleQuery = Matches.Query;
        if (req.query.season) {
            multipleQuery = Matches.find({season: req.query.season});
        }
        //covers if one/both of them is undefined
        if (req.query.team1 === undefined || req.query.team2 === undefined) {
            if (req.query.team1 !== undefined) {
                multipleQuery.find({$or: [{team1: req.query.team1}, {team2: req.query.team1}]});
            }
            else if(req.query.team2 !== undefined) {
                multipleQuery.find({$or: [{team1: req.query.team2}, {team2: req.query.team2}]});
            }
        }
        //neither of them is undefined
        else {
            multipleQuery.find({$or:[{$and:[{team1: req.query.team1}, {team2: req.query.team2}]},{$and:[{team1: req.query.team2}, {team2: req.query.team1}]}]});
        }

        multipleQuery.exec(function (err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);

        });


        // Matches.find(req.query, function(err, result) {
        //     if(err) {
        //         return next(err);
        //     }
        //     res.json(result);
        // })
    });


module.exports = matchRouter;