var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//Creating the table
var usersSchema = new Schema({
    userName: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    city: String,
    state: String,
    sQuestion: String,
    sAnswer: String
});

//To use the schema definition (Table)
var Blog = mongoose.model('Blog', blogSchema);

