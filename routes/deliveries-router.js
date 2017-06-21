var express = require('express'),
    deliveriesRouter = express.Router(),
    Deliveries = require('../models/deliveries'),
    Matches = require('../models/match');


deliveriesRouter.route('/live')
    .get(function(req, res, next) {
        var id = parseInt(req.query.first, 10);

        var ids =[id, id+1, id+2, id+3];
        console.log(ids);
        Deliveries.find({match_id: {$in:ids}},
        function(err, result) {
            if(err) {
                return next(err);
            }
            Matches.find({id:{$in:ids}}, function(err, matchStats) {
                if(err) {
                    return next(err);
                }
                result.push(matchStats);
                console.log(matchStats);
                res.json(result);
            });

        });
    });

deliveriesRouter.route('/match/:id')
.get( function(req, res, next) {
    var id = parseInt(req.params.id, 10);
    Deliveries.find({match_id: id}, function (err, result) {
        if (err) {
            return next(err);
        }
        res.json(result);
    });
});

module.exports = deliveriesRouter;