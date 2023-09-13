const express = require('express');
const router = express.Router();
// const con = require('../connection');
const con = require('../database/dbConnect');
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

// mail-object///////////////////////////////
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'backupjeet96@gmail.com',
    pass: 'qpscbjrbigosmngu'
  }
});






// register-api//////////////////////////////////////////////////////

router.post('/register',async (req,res,next)=>{
	const date_ob = new Date();
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


	// phone-check
   con.query('SELECT COUNT(*) AS cnt FROM user WHERE phone = ?',user.username,(err,result)=>{
   	if(result[0].cnt > 0){  
             return res.status(400).json({'validation_error':"Phone Number Already Added"});
       }else{
       	const data={role:user.role,phone:user.username,otp:otp,created_at:date_ob.toISOString().substring(0,10)};
			con.query('INSERT INTO user SET ?',data,(err,result)=>{
				if (!err) {
					// otp-generation
					
					const lastid = result.insertId;
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
					return res.status(500).json({message:err});
				}
			});
       }
   });			

		

		
	
	

	}else{

   // phone-check
   con.query('SELECT COUNT(*) AS cnt FROM user WHERE email = ?',user.username,(err,result)=>{
   	if(result[0].cnt > 0){  
             return res.status(400).json({'validation_error':"Email Already Added"});
       }else{
       	const data={role:user.role,email:user.username,otp:otp,created_at:date_ob.toISOString().substring(0,10)};
			con.query('INSERT INTO user SET ?',data,(err,result)=>{
				if (!err) {
					
					const lastid = result.insertId;

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
					
				}else{
					return res.status(500).json({message:err});
				}
			});


		}

   });		
		
}  

});



// verify-otp//////////////////////////////////////////////////////////////////////////

router.post('/verify-otp',async (req,res,next)=>{

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
   const hashedPassword = await bcrypt.hash(user.password,10);

   con.query('SELECT * FROM user WHERE id = ? AND otp = ?',[data.id,data.otp],(err,result)=>{
		if (!err) {
			if (result=="") {
				return res.json({status:400,message:"Wrong Otp"});
			}else{
				con.query('UPDATE user SET ? WHERE ?', [{ otp: null,status:"A",password:hashedPassword}, { id: data.id }]);

				// crate and assign a token
				const token = jwt.sign({_id:data},process.env.TOKEN_SECRET);




				return res.json({status:200,message:"Otp Verified Successfully",user_details:result,token:token});
			}	
			
		}else{
			return res.json({status:500,message:err});
		}
	})


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
   	con.query('SELECT * FROM user WHERE phone = ? limit 1 ',user.username,(err,result)=>{
      const length = result.length;
      // return res.json(length);
      // return res.json(result[0].password);
   	if(length == 1){

   	 bcrypt.compare(user.password,result[0].password, function(err, password_res) {
   	// return res.json(password_res);	
		 // make your checks here
		    if (password_res==false || password_res==null) {
		      return res.status(400).json({'validation_error':"Invalid Password"});
		    }
		    else if(result[0].status!="A")
		    {
		    	return res.status(400).json({'validation_error':"User Not In Active Status"});
		    }
		    else{
		    	con.query('SELECT *  FROM user WHERE phone = ? limit 1',user.username,(err,userDetails)=>{
	      	const token = jwt.sign({_id:userDetails},process.env.TOKEN_SECRET);
	      	return res.json({status:200,message:"Login Successfully",user_details:userDetails,token:token});
	      })
		    }
		})
   	// if (!validaPassword) {return res.status(400).json({'validation_error':"Invalid password"})}; 	

      
      


       
       }else{
       	   return res.status(400).json({'validation_error':"Phone Number Not Found In Our Platform"});
       }
    });
   	

   

   }else{

   	

   	con.query('SELECT * FROM user WHERE email = ? limit 1 ',user.username,(err,result)=>{

      const length = result.length;
      // return res.json(length);
      // return res.json(result[0].password);
   	if(length == 1){

   	 bcrypt.compare(user.password,result[0].password, function(err, password_res) {
   	
		 // make your checks here
		    if (password_res===false || password_res==null) {
		      return res.status(400).json({'validation_error':"Invalid Password"});
		    }
		    else if(result[0].status!="A")
		    {
		    	return res.status(400).json({'validation_error':"User Not In Active Status"});
		    }
		    else{
		    	con.query('SELECT *  FROM user WHERE email = ? limit 1',user.username,(err,userDetails)=>{
	      	const token = jwt.sign({_id:userDetails},process.env.TOKEN_SECRET);
	      	return res.json({status:200,message:"Login Successfully",user_details:userDetails,token:token});
	      })
		    }
		})
   	// if (!validaPassword) {return res.status(400).json({'validation_error':"Invalid password"})}; 	

      
      


       
       }else{
       	   return res.status(400).json({'validation_error':"Email Not Found In Our Platform"});
       }
    });


   






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
   con.query('SELECT * FROM user WHERE phone = ? limit 1 ',user.username,(err,result)=>{
   const length = result.length;
   if (length==1) {
   	if(result[0].status!="A")
		{
		    	return res.status(400).json({'validation_error':"User Not In Active Status"});
		}
		else{
			const welcomeMessage = `Welcome to Indiplug.Your verification otp is ${otp}.Do not share this otp with anyone`;
                    
                    const accountSid = process.env.TWILIO_ACCOUNT_SID;
					const authToken = process.env.TWILIO_AUTH_TOKEN;
					const client = require('twilio')(accountSid, authToken);
					client.messages
					  .create({
					     body: welcomeMessage,
					     from: '+17622454265',
					     to: user.username
					   })
					  .then(message => console.log(message.sid));
		    con.query('UPDATE user SET ? WHERE ?', [{ otp: otp}, { id: result[0].id }]);
		    return res.status(200).json({status:200,otp:otp});
		}
   
   }else{
   	return res.status(400).json({'validation_error':"Phone Number Not Found In Our Platform"});
   }

   })  


   }else{


   con.query('SELECT * FROM user WHERE email = ? limit 1 ',user.username,(err,result)=>{
   const length = result.length;
   if (length==1) {
   	if(result[0].status!="A")
		{
		    	return res.status(400).json({'validation_error':"User Not In Active Status"});
		}
		else{
		    con.query('UPDATE user SET ? WHERE ?', [{ otp: otp}, { id: result[0].id }]);
		    var mailOptions = {
					  from: 'developersayan2001@gmail.com',
					  to: user.username,
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

		   return res.status(200).json({status:200,otp:otp,message:'Otp Send Successfully In Your Mail'});
		}
   
   }else{
   	return res.status(400).json({'validation_error':"Email Not Found In Our Platform"});
   }

   })	
   


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

   con.query('SELECT * FROM user WHERE otp = ? limit 1 ',req.body.otp,(err,result)=>{
      const length = result.length;
      if (length==1) {
      
      
      con.query('UPDATE user SET ? WHERE ?', [{ otp: null,password:hashedPassword}, { id: result[0].id}]);	
      return res.status(200).json({'status':200,'message':'Password Changed Successfully'});
      
      }else{
      	return res.status(400).json({'validation_error':"Wrong Otp."});
      }	
   })





});


router.get('/user-details',verify,async(req,res)=>{
		 const token = req.header('auth-token');
	    const user = jwt.verify(token,process.env.TOKEN_SECRET);
	    con.query('SELECT * FROM user WHERE id = ?',user._id[0].id,(err,result)=>{
	    	if (!err) {
	    		return res.json({status:200,data:result});
	    	}else{
			return res.json({status:500,message:err});
		   }
	    });	
	    
});



const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null
        }
      cb(uploadError,path.join(__dirname, '../uploads/'))
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = file.originalname.split(' ').join('-') 
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })

const uploadOptions = multer({ storage: storage })



// update-profile/////////////////////////////////////////////
router.post('/update-profile',uploadOptions.single('image'),verify,async(req,res)=>{
	const data = req.body;
	// return res.json('sayan');

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
   const file  = req.file;
   const fileName = req.file.filename;
   con.query('UPDATE user SET ? WHERE ?', [{ name: data.name,location:data.name,genre:data.genre,bio:data.bio,image:fileName}, { id: data.user_id }]);
   res.status(200).json({status:"200",message:"Profile Updated Successfully"});

});





// get-users/////////////////////////////////////////////////////////////////////////////////////////

router.get('/get-users',async (req,res,next)=>{

   con.query('SELECT * FROM user',(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});

module.exports = router;