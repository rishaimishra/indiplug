const express = require('express');
const router = express.Router();
const con = require('../connection');
const Joi = require('joi'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const verify = require('./verifyToken');
const multer  = require('multer');
const path = require('path');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'event')
  },
  filename:function(req,file,cb){
  	cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname))
  }
})


var upload = multer({ storage: storage });
var multipleUpload = upload.fields([{name:'media'},{name:'audio'}]);


router.post('/event-add', multipleUpload, function(req, res) { 
  	const data = req.body;
	const date_ob = new Date();
	const schema = Joi.object({
	    description: Joi.required(),
	    title: Joi.required(),
	    location: Joi.required(),
	    start_date: Joi.required(),
	    start_time: Joi.required(),
	    end_date: Joi.required(),
	    end_time: Joi.required(),
	    user_id:Joi.required(),
    })

   // validation///////////////////////////////
   const validationError = schema.validate(req.body);
   const { value, error } = validationError; 
   const valid = error == null; 
   if (!valid) {
   	return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
   }


   var mediaName = req.files.media[0].filename;
   var audioName = req.files.audio[0].filename;

   const post={
   	title:data.title,
   	start_date:data.start_date,
   	start_time:data.start_time,
   	end_date:data.end_date,
   	end_time:data.end_time,
   	description:data.description,
   	user_id:data.user_id,
   	location:data.location,
   	media:mediaName,
   	audio:audioName,
   	created_at:date_ob.toISOString().substring(0,10)
   };

   con.query('INSERT INTO event SET ?',post,(err,result)=>{
   if (!err) {
			return res.status(200).json({'success':true,'message':'Data Inserted Successfully'}); 
	}else{
		return res.status(500).json({message:err});
		}
	});
});



router.get('/all-events',async(req,res)=>{
	con.query('SELECT * FROM event',(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});


router.get('/user-event/:id',async(req,res)=>{
	con.query('SELECT * FROM event WHERE ?',{user_id:req.params.id},(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});


router.get('/user-event/delete/:id',async(req,res)=>{
	con.query('DELETE FROM event WHERE ?',{id:req.params.id});
	return res.json({status:200,message:'Music Post Deleted Successfully'});
});


router.get('/user-event/details/:id',async(req,res)=>{
	con.query('SELECT * FROM event WHERE ?',{id:req.params.id},(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});

module.exports = router;