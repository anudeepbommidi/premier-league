var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var deliveriesSchema = new Schema({

    match_id: {
        type: Number,
        required: true
    },
    inning: {
        type: Number
    },
    batting_team: {
        type: String,
        default:''
    },
    bowling_team: {
        type: String,
        default:''
    },
    over: {
        type: Number
    },
    ball: {
        type: Number
    },
    batsman: {
        type: String
    },
    non_striker: {
        type: String
    },
    bowler: {
        type: String
    },
    is_super_over: {
        type: Number
    },
    wide_runs: {
        type: Number
    },
    bye_runs: {
        type: Number
    },
    legbye_runs: {
        type: Number
    },
    noball_runs: {
        type: Number
    },
    penalty_runs: {
        type: Number
    },
    batsman_runs: {
        type: Number
    },
    extra_runs: {
        type: Number
    },
    total_runs: {
        type: Number
    },
    player_dismissed: {
        type: String,
        default: ''
    },
    dismissal_kind: {
        type: String,
        default: ''
    },
    fielder: {
        type: String,
        default:''
    }

});


module.exports = mongoose.model('Deliveries', deliveriesSchema, 'Deliveries');