/*
var express = require('express'),
    searchRouter = express.Router(),
    Matches = require('../models/match');

searchRouter.route('/results')
.get(function(req, res, next) {
    var query = req.query;
    if(Matches.isValid(query)) {
        Matches.find({ $or : [{team1: req.query}, {team2: req.query}]})
            .sort({year: -1})
            .exec(function(err, result) {
                if(err) {
                    return next(err);
                }
                res.json(result);
            }) ;
    }
    else {
        res.status(404);
        res.end('No matches found for the provided team');
    }
});


module.exports = searchRouter;*/
