const express = require("express")
const app = express()
const mongoose = require("mongoose")
//import Routes
const theRoute = require('./routes/index');
const bodyParser = require('body-parser')
const cors = require('cors');

const multer = require('multer')
const upload = multer()

//const cookieParser = require('cookie-parser');
require('dotenv').config();


//connect to db
mongoose.connect(process.env.DB_CONNECT,
    {useNewUrlParser: true,
    useUnifiedTopology: true,
useFindAndModify: false},
    () => console.log('connected to db!')
);

// middlewares

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());


//Routes middlewares
app.use('/api', theRoute);

// app.use(upload.array());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server up and running');
  });