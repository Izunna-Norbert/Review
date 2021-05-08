const mongoose = require("mongoose");


const reviewSchema = new mongoose.Schema({
    description:{
        type:String
    },
    helpful:{
        type: Number,
        default: 0
    },
    apartment:{
        type: mongoose.Schema.Types.ObjectId , ref:"apartment"
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    file:{
        type: String
    }
})

module.exports = mongoose.model("review",reviewSchema);