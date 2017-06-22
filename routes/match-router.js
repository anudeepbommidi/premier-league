var express = require('express'),
    matchRouter = express.Router(),
    Matches = require('../models/match');


matchRouter.route('/')
    .get(function (req, res, next) {

        var query;
        if (req.query.season && !req.query.team1 && !req.query.team2) {
            query = Matches.find({season: req.query.season});
        }
        else if (req.query.season && req.query.team1 && !req.query.team2) {
            query =  Matches.find({$and:[{season: req.query.season}, {$or: [{team1: req.query.team1}, {team2: req.query.team1}]}]});
        }
        else if (req.query.season && !req.query.team1 && req.query.team2) {
            query = Matches.find({$and:[{season: req.query.season}, {$or: [{team1: req.query.team2}, {team2: req.query.team2}]}]});
        }
        else if (!req.query.season && req.query.team1 && !req.query.team2) {
            query = Matches.find({$or: [{team1: req.query.team1}, {team2: req.query.team1}]});
        }
        else if (!req.query.season && !req.query.team1 && req.query.team2) {
            query = Matches.find({$or: [{team1: req.query.team2}, {team2: req.query.team2}]});
        }
        else if (!req.query.season && req.query.team1 && req.query.team2) {
            query = Matches.find({$or: [{$and:[{team1: req.query.team1}, {team2: req.query.team2}]},
                                                    {$and:[{team1: req.query.team2}, {team2: req.query.team1}]}]});
        }
        else {
            query = Matches.find({$or:[{$and:[{season:req.query.season}, {team1: req.query.team1}, {team2: req.query.team2}]},
                {$and:[{season:req.query.season}, {team1: req.query.team2}, {team2: req.query.team1}]}]});
        }

        query.exec(function (err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);

        });

    });


module.exports = matchRouter;