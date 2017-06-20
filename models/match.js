var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var matchSchema = new Schema({

    id: {
        type: Number,
        required: true
    },
    season: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        default:''
    },
    date: {
        type: Date
    },
    team1: {
        type: String,
        required: true
    },
    team2: {
        type: String,
        required: true
    },
    toss_winner: {
        type: String,
        default: ''
    },
    toss_decision: {
        type: String,
        default: ''
    },
    result: {
        type: String,
        default: ''
    },
    dl_applied: {
        type: Number
    },
    winner: {
        type: String,
        default: ''
    },
    win_by_runs: {
        type: Number
    },
    win_by_wickets: {
        type: Number
    },
    player_of_match: {
        type: String,
        default: ''
    },
    venue: {
        type: String,
        default: ''
    },
    umpire1: {
        type: String,
        default: ''
    },
    umpire2: {
        type: String,
        default: ''
    },
    umpire3: {
        type: String,
        default: ''
    }

});


module.exports = mongoose.model('Match', matchSchema, 'Matches');