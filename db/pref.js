var mongoose = require('mongoose');
var Schema = mongoos.Schema;

var prefSchema = new Schema({
    _id: mongoose
    preference: String
});

var pref = mongoose.model('Preference', prefSchema);
