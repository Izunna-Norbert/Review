const mongoose = require("mongoose");


const apartmentSchema = new mongoose.Schema({
    landlord:{
        type:String
    },
    location:{
        type: String
    },
    description:{
        type: String
    },
    reviews:[{
        type: mongoose.Schema.Types.ObjectId, ref:'review'
    }]
})

module.exports = mongoose.model("apartment",apartmentSchema);