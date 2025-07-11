const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
    required: true,
  },
  Image: {
    type: String,
  },

  FirstName: {
    type: String,
    required: true,

  },
  LastName: {
    type: String,
    required: true,

  },
  Email: {
    type: String,
    required: true,
    unique: true,

  },

  Password: {
    type: String,
    required: true,
    trim: true
  },
resetPasswordToken:String,
resetPasswordExpires:Date,
 

    
});

const user = mongoose.model("userModel", userSchema)
module.exports = user
