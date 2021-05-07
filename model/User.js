const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs")
// const salt=10;
// const jwt=require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gender:{
    type: String,
  },
  resetPasswordToken:{
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
});


// export model user with UserSchema
module.exports = mongoose.model("user", userSchema);
