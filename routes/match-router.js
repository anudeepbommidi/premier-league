var express = require('express'),
    matchRouter = express.Router(),
    Matches = require('../models/match');


matchRouter.route('/')
    .get(function (req, res, next) {

       console.log(req.query);
       Matches.find(req.query, function(err, result) {
           if(err) {
               return next(err);
           }
           res.json(result);
       })
    });


module.exports = matchRouter;