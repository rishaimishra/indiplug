const express = require('express');
const router = express.Router();
// const con = require('../database/dbConnect');
const bcrypt = require("bcrypt");
const Joi = require('joi'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");

const verify = require('./verifyToken');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');
const sendSms = require('./twilio');
const UserModel = require('../models/UserModel');

// mail-object///////////////////////////////
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'activarmor.test@gmail.com',
    pass: 'ynwqbrlxsvwumfqf'
  }
});

router.get('/book-artist',async(req,res)=>{
  

   res.send({msg:"j"})
});

// register-api//////////////////////////////////////////////////////

router.post('/register',async (req,res,next)=>{

    
  try{
  const user = req.body;

  const schema = Joi.object({
    username: Joi.required(),
    // password: Joi.required(),
    role:Joi.required(),
    })

   const validationError = schema.validate(req.body);
   const { value, error } = validationError; 
   const valid = error == null; 
   if (!valid) {
    return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
   }  
   

   

  
  const role = req.body.role;
  // const hashedPassword = await bcrypt.hash(user.password,10);
  const otp = Math.floor(Math.random() * 90000) + 10000;
  if(!isNaN(user.username)){

    // return res.json(user.username);

    const isExist = await UserModel.findOne({
      where: {
        phone: user.username
      }
    })
    
    if (isExist) {
      return res.status(400).json({'validation_error':"Phone Number Already Added"});
    }

    const User = await UserModel.create({
      role:user.role,
      phone:user.username,
      otp:otp,
    });

    
    const lastid = User.id;
    const welcomeMessage = `Welcome to Indiplug.Your verification ots is ${otp}.Do not share this otp with anyone`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
         body: welcomeMessage,
         from: '+16089339267',
         to: user.username
       })
      .then(message => console.log(message.sid));
      

    return res.status(200).json({'lastid':lastid,'otp':otp});

}else{



    const isExist = await UserModel.findOne({
      where: {
        email: user.username
      }
    })
    
    if (isExist) {
      return res.status(400).json({'validation_error':"Email Already Added"});
    }

    const User = await UserModel.create({
      role:user.role,
      email:user.username,
      otp:otp,
    });

    
    const lastid = User.id;
    var mailOptions = {
            from: 'developersayan2001@gmail.com',
            to: user.username,
            subject: 'Otp Sent Successfully',
            text: 'Otp is:'+otp,
          };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });

    return res.status(200).json({'lastid':lastid,'otp':otp});
    
    
}
} catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      msg:error,
      response: 'something is wrong'
    })
  }
});



// verify-otp//////////////////////////////////////////////////////////////////////////

router.post('/verify-otp',async (req,res,next)=>{


  try{
  const data = req.body;
  // return res.json('sayan');

  const schema = Joi.object({
    otp: Joi.required(),
    id: Joi.required(),
    password:Joi.required(),
   })

   // validation///////////////////////////////
   const validationError = schema.validate(req.body);
   const { value, error } = validationError; 
   const valid = error == null; 
   if (!valid) {
    return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
   }  
   const hashedPassword = await bcrypt.hash(data.password,10);

   const otpCheck = await UserModel.findOne({
      where: {
        otp: data.otp,
        id:data.id
      }
    })
    
    if (otpCheck) {
      const update = await UserModel.update(
      { 
                    otp: null,
                    password: hashedPassword,
                    status:"A"
                    
      },
          { where: { id: data.id } }
      );

      const token = jwt.sign({_id:otpCheck},process.env.TOKEN_SECRET);
      return res.json({status:200,message:"Otp Verified Successfully",user_details:otpCheck,token:token});
    
    }else{
      return res.json({status:400,message:"Wrong Otp"});
    }

  }catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      msg:error,
      response: 'something is wrong'
    })
  }

});




router.post('/login',async (req,res,next)=>{
  const schema = Joi.object({
    username: Joi.required(),
    password: Joi.required(),
    })
  const user = req.body;

   const validationError = schema.validate(req.body);
   const { value, error } = validationError; 
   const valid = error == null; 
   if (!valid) {
    return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
   }



   if(!isNaN(user.username)){

    const user = await UserModel.findOne({
      where: {
        phone: req.body.username,
      },
    });

    

    if (user) {
      const isMatched = await bcrypt.compare(req.body.password, user.password);
      if (isMatched) {
        const token = jwt.sign({_id:user},process.env.TOKEN_SECRET);
        return res.json({status:200,message:"Login Successfully",user_details:user,token:token});

      }else{
        return res.status(400).json({'validation_error':"Invalid password"})
      }  
    

    }else{
      return res.status(400).json({'validation_error':"Phone Number Not Found In Our Platform"});
    }
    
    }else{

    

    const user = await UserModel.findOne({
      where: {
        email: req.body.username,
      },
    });

    if (user) {
      const isMatched = await bcrypt.compare(req.body.password, user.password);
      if (isMatched) {
        const token = jwt.sign({_id:user},process.env.TOKEN_SECRET);
        return res.json({status:200,message:"Login Successfully",user_details:user,token:token});

      }else{
        return res.status(400).json({'validation_error':"Invalid password"})
      }  
    

    }else{
      return res.status(400).json({'validation_error':"Phone Number Not Found In Our Platform"});
    }

}  
   
});




router.post('/send-otp-verification', async (req,res,next)=>{
  const otp = Math.floor(Math.random() * 90000) + 10000;
  const schema = Joi.object({
    username: Joi.required(),
   })
  const user = req.body;

   const validationError = schema.validate(req.body);
   const { value, error } = validationError; 
   const valid = error == null; 
   if (!valid) {
    return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
   }

   if(!isNaN(user.username)){
   


    const user = await UserModel.findOne({
      where: {
        phone: req.body.username,
      },
    });

    if (user) {
      if(user.status!="A")
      {
          return res.status(400).json({'validation_error':"User Not In Active Status"});
      }

      const welcomeMessage = `Welcome to Indiplug.Your verification otp is ${otp}.Do not share this otp with anyone`;

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require('twilio')(accountSid, authToken);

      client.messages
        .create({
           body: welcomeMessage,
           from: '+16089339267',
           to: req.body.username
         })
        .then(message => console.log(message.sid));

      const update = await UserModel.update(
      { 
                    otp: otp
                    
      },
          { where: { id: user.id } }
      );  

    return res.status(200).json({status:200,otp:otp});


    }else{
      return res.status(400).json({'validation_error':"Phone Number Not Found In Our Platform"});
    }


}else{


  const user = await UserModel.findOne({
      where: {
        email: req.body.username,
      },
    });


      if (user) {
      if(user.status!="A")
      {
          return res.status(400).json({'validation_error':"User Not In Active Status"});
      }


      var mailOptions = {
            from: 'developersayan2001@gmail.com',
            to: req.body.username,
            subject: 'Reset Password Otp Sent Successfully',
            text: 'Otp is:'+otp,
       };

      transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
      });

      

      const update = await UserModel.update(
      { 
                    otp: otp
                    
      },
          { where: { id: user.id } }
      );  

    return res.status(200).json({status:200,otp:otp});


    }else{
      return res.status(400).json({'validation_error':"Email Not Found In Our Platform"});
    }

   }  
});




router.post('/verify-otp-reset-password', async(req,res,next)=>{
  const schema = Joi.object({
    otp: Joi.required(),
    password:Joi.required(),
   })
  
  const validationError = schema.validate(req.body);
   const { value, error } = validationError; 
   const valid = error == null; 
   if (!valid) {
    return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
   }
   const hashedPassword =  await bcrypt.hash(req.body.password,10);
   
   const isExist = await UserModel.findOne({
      where: {
        otp: req.body.otp
      }
    });
   
   
   if (isExist) {
      const update = await UserModel.update(
      { 
         otp: null,
         password:hashedPassword
                    
      },
          { where: { id: isExist.id } }
      ); 

    return res.status(200).json({'status':200,'message':'Password Changed Successfully'});  
   }else{
    return res.status(400).json({'validation_error':"Wrong Otp."});
   }


});

router.get('/user-details',verify,async(req,res)=>{
     const token = req.header('auth-token');
      const user = jwt.verify(token,process.env.TOKEN_SECRET);
      
      const data  = await UserModel.findOne({
        where:{
          id:user._id.id,
        }
      });
      return res.json({status:200,data:data});
});



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'uploads')
  },
  filename:function(req,file,cb){
    cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname))
  }
})


var tech = multer({ storage: storage });
var multipleUpload = tech.fields([{name:'image'}]);



// update-profile/////////////////////////////////////////////
router.post('/update-profile',multipleUpload,verify,async(req,res)=>{
  const data = req.body;
  // return res.json('sayan');
   // console.log(req.files.image);
   // process.exit(0);

  const schema = Joi.object({
      name: Joi.required(),
      location: Joi.required(),
      genre: Joi.required(),
      bio: Joi.required(),
      user_id:Joi.required(),
   })

   // validation///////////////////////////////
   const validationError = schema.validate(req.body);
   const { value, error } = validationError; 
   const valid = error == null; 
   if (!valid) {
    return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
   }
  
   if (req.files.image) {var imageName = req.files.image[0].filename;}else{var imageName = null};
   // console.log(imageName);
   const update = await UserModel.update(
   { 
         name: data.name,
         location:data.name,
         genre:data.genre,
         bio:data.bio,
         image:imageName
                    
      },
      { where: { id: data.user_id } }
    );
   res.status(200).json({status:"200",message:"Profile Updated Successfully"});

});




module.exports = router;