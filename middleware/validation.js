//Validation 
const Joi = require("joi");

const registerValidation = data =>{
const schema = Joi.object( {
    name: Joi.string()
                .required(),
    email: Joi.string()
                .required()
                .email(),
    gender: Joi.string()
                .required(),
    password: Joi.string()
                .min(6)
                .required(),
    confirm_password: Joi.string()
                .min(6)
                .required(),

});
   return schema.validate(data);
};

const loginValidation = data =>{
    const schema = Joi.object( {
        email: Joi.string()
                .required()
                .email(),
        password: Joi.string()
                    .min(6)
                    .required(),   
    
    });
       return schema.validate(data);
    };
const apartmentValidation  = data =>{
    const schema = Joi.object( {
        landlord: Joi.string()
                .required(),
        location: Joi.string()
                    .required(),
        description: Joi.string()
                    .required(),   
    
    });
       return schema.validate(data);
    };  
const reviewValidation  = data =>{
    const schema = Joi.object( {
        description: Joi.string()
                    .required(),   
    });
        return schema.validate(data);
    };
    

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.apartmentValidation = apartmentValidation;
module.exports.reviewValidation = reviewValidation;