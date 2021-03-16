const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const HackerSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
});

HackerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Hacker', HackerSchema);

