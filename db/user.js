var mongoose = require('mongoose')
var Schema = mongoose.Schema

//Creating the table
var usersSchema = new Schema({
    userName: String,
    salt: Buffer,
    shash: Buffer,
    firstName: String,
    lastName: String,
    email: String,
    city: String,
    state: String,
    sQuestion: String,
    sAnswer: String
})

//To use the schema definition (Table)
var User = mongoose.model('User', usersSchema)

module.exports = User
