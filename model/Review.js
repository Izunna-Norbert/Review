const mongoose = require("mongoose");


const reviewSchema = new mongoose.Schema({
    description:{
        type:String
    },
    count:{
        type: Number,
        default: 0
    },
    apartment:{
        type: mongoose.Schema.Types.ObjectId , ref:"apartment"
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("review",reviewSchema);