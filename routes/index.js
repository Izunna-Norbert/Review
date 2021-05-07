const router = require("express").Router();
const User = require("../model/User")
const {registerValidation,loginValidation,apartmentValidation,reviewValidation} = require("../middleware/validation")
const auth = require("../middleware/verify.token")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
//const async = require('async')
const nodemailer = require('nodemailer');
//const randomString = require('randomstring')
const crypto = require("crypto")
const mailer = require('../middleware/mailer')
const Blacklist = require("../model/Blacklist");
const Apartment = require("../model/Apartments");
const mongoose = require("mongoose");
const { nextTick } = require("process");

const multer  = require('multer');
const Review = require("../model/Review");
// const multerS3 = require('multer-s3');
// const AWS = require('aws-sdk');

// const s3 = new AWS.S3({
//     accessKeyId: process.env.S3_ACCESS_KEY,
//     secretAccessKey: process.env.S3_ACCESS_SECRET
// });

// const uploadS3 = multer({
//   storage: multerS3 ({
//     s3: s3,
//     acl: 'public-read',
//     bucket: 'izunna',
//     metadata: (req, file, cb) => {
//       cb(null, {fieldName: file.fieldname})
//     },
//     key: (req, file, cb) => {
//       cb(null, Date.now().toString() + '-' + req.user._id + '-' + file.originalname)
//     }
//   })
// });

router.get('/dashboard',auth, (req,res) =>{

    User.findById(req.user._id, function(err, user) {
        if(user){
            res.json({
                user:user
            })
        }
        else{
            res.status(400).json({error:"User not Found"})
        }
     });
        
    
 })


router.post('/register', async (req,res) =>{
    console.log(req.body)
    const {error} = registerValidation(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    //check if user exists
    const emailExist = await User.findOne({email: req.body.email})
    if(emailExist){
        return res.status(400).json({error:'Email already exists'});
    }
    if(req.body.password != req.body.confirm_password){
        return res.status(400).json({error:"passwords don't match"})
    }
//crypting passwords
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);
//creating a new user
    const user = new User ({
        name: req.body.name,
        email : req.body.email,
        gender : req.body.gender,
        password : hashPassword
    })
    try {
       const saveduser = await user.save();
       const tempuser = {
           createdAt: saveduser.createdAt,
           _id: saveduser._id,
           name: saveduser.name,
           email : saveduser.email,
           gender : saveduser.gender,
       }

       const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET,{expiresIn: '3h'})
       res.header('Authorization', token);
       res.json({user:tempuser, token:token});
    }catch(err){
        res.status(400).json(err);
    }
})

//login
router.post('/login', async (req,res) =>{
    const {error} = loginValidation(req.body);
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    //check if user exists
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({error:"Email or password doesn't exists"});
    }
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass){
        res.status(400).json({error:"Invalid Password"})
    }
    else{
        
        
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET,{expiresIn: '3h'})
    res.header('Authorization', token);
    res.json({user:user,token:token});
    }
})

router.get('/', async (req,res) =>{
    if(req.query.sort == 'Top'){
        const reviews = await Review.find().populate('apartment').sort({count: -1})
    if(reviews){
        res.status(200).json(
            reviews    
        )
    }
    else{
        res.status(400).json({error:"No Reviews Found"})
    }
    }
    else{
   const reviews = await Review.find().populate('apartment')
    if(reviews){
        res.status(200).json(
            reviews    
        )
    }
    else{
        res.status(400).json({error:"No Reviews Found"})
    }
}
 });


router.get('/logout',auth,function(req,res){
    console.log(req.header("Authorization"))
    const blacktoken = new Blacklist({
        token: req.header("Authorization")
    })
    try{
        blacktoken.save();
        res.status(200).json({
            user : "logged out successfully"
        });

    }catch(err){
        res.status(400).json(err)
    }
    
    });
router.post('/new-apartment',auth, async (req,res) =>{
    console.log(req.body)
    const {error} = apartmentValidation(req.body);
    if(error){
            return res.status(400).json({error:error.details[0].message})
        }
    //creating a new user
        const apartment = new Apartment ({
            landlord: req.body.landlord,
            location : req.body.location,
            description : req.body.description,
            })
        try {
           const house = await apartment.save();
           const temphouse = {
               _id: house._id,
               landlord: house.landlord,
               location : house.location,
               description : house.description,
           }
           res.status(200).json({apartment:temphouse});
        }catch(err){
            res.status(400).json(err);
        }
    })  
router.post('/:id/review',auth, async (req,res) =>{
    console.log(req.body)
    console.log(req.params.id)
    await Apartment.findById(req.params.id, async function(err, apartment) {
        console.log(apartment)
        if(apartment){
            const {error} = reviewValidation(req.body);
        if(error){
                return res.status(400).json({error:error.details[0].message})
            }
            //create the review
            const review = new Review ({
                description : req.body.description,
                apartment: req.params.id
                })
            try {
               await review.save();
               apartment.reviews.push(review)
               await apartment.save()
               res.status(200).json({success: "successfully posted a review" });
            }catch(err){
                res.status(400).json(err);
            }

        }
        else{
            res.status(400).json({error:"apartment not Found"})
        }
     });
    
        })  
router.post('/:id/mark', async(req,res) => {
    try{
        await Review.findByIdAndUpdate(req.params.id, {$inc:{count: 1}})
        res.status(200).json({"success":"marked as helpful"})
    }
    catch(err){
        res.status(400).json(err)
    }

})

router.post('/forgot-password',(req,res) =>{
          const buf = crypto.randomBytes(20)
          var token = buf.toString('hex')
          User.findOne({ email: req.body.email }, function(err, user) {
            if (!user) {
                res.status(400).json({error:"No account with that email address exists"})
            }
            else{
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
            user
            .save()
            .then(user => {
                // Compose email
                const transport = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                      user: 'apikey',
                      pass: process.env.SENDGRID_PASS
                    },
                    tls: {
                      rejectUnauthorized: false
                    }
                  });
                var mailOptions = {
                    from:'no-reply@iqubelabs.com',
                    to: user.email,
                    subject:  'Password Reset!',
                    text: 'Hey there, it’s our first message sent with Nodemailer ;) ', 
                    html : `Hi there,
            <br/>
            This email was sent if you asked for a password reset!
            <br/><br/>
            Please verify your email by typing the following token:
            <br/>
            Token: <b>${token}</b>
            <br/>
            This token expires in 60 minutes
            
            Have a pleasant day.`
                };
            // Send email
            transport.sendMail(mailOptions, (error, info) => {
                 if (error) {
                     return res.status(400).send(error);
            }
            res.json({success:"A mail has been sent for further instructions"})
            });
             
            })
            .catch(err => res.send(err));
        }
         
})
})
router.post('/reset-password', (req,res) =>{
    console.log(req.headers.token)
    User.findOne({ resetPasswordToken: req.headers.token ,resetPasswordExpires: { $gt: Date.now() }}).then(user => {
        if (!user) {
          return res.status(400).json({error:'Password reset token is invalid or has expired.'});
        }
        else{
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        password = req.body.password;
        console.log(password)
        

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) res.status(400).send(err);
            user.password = hash;
            user.save();
            res.json({success:'Password succesfully changed'});
          });
        });
    }
      }); 
})

module.exports = router;