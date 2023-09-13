const express = require('express');
const router = express.Router();
// const con = require('../connection');
// const bcrypt = require("bcrypt");
const Joi = require('joi'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");
const verify = require('./verifyToken');


router.get('/book-artist',async(req,res)=>{
	

   res.send({msg:"j"})
});






























// router.post('/book-artist',async(req,res)=>{
// 	const data = req.body;
// 	const date_ob = new Date();
// 	const schema = Joi.object({
// 	    description: Joi.required(),
// 	    title: Joi.required(),
// 	    location: Joi.required(),
// 	    start_date: Joi.required(),
// 	    start_time: Joi.required(),
// 	    end_date: Joi.required(),
// 	    end_time: Joi.required(),
// 	    user_id:Joi.required(),
// 	    booking_user_id:Joi.required(),
//     })


//     // validation///////////////////////////////
//    const validationError = schema.validate(req.body);
//    const { value, error } = validationError; 
//    const valid = error == null; 
//    if (!valid) {
//    	return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
//    }


//    const post={
//    	title:data.title,
//    	start_date:data.start_date,
//    	start_time:data.start_time,
//    	end_date:data.end_date,
//    	end_time:data.end_time,
//    	description:data.description,
//    	user_id:data.user_id,
//    	location:data.location,
//    	booking_user_id:data.booking_user_id,
//    	created_at:date_ob.toISOString().substring(0,10)
//    };

//    con.query('INSERT INTO book SET ?',post,(err,result)=>{
//    if (!err) {
// 			return res.status(200).json({'success':true,'message':'Data Inserted Successfully'}); 
// 	}else{
// 		return res.status(500).json({message:err});
// 		}
// 	});
// });

// router.get('/user-bookings/:id',async(req,res)=>{
// 	con.query('SELECT * FROM book WHERE ?',{user_id:req.params.id},(err,result)=>{
// 		if (!err) {
// 			return res.json({status:200,data:result});
// 		}else{
// 			return res.json({status:500,message:err});
// 		}
// 	})
// });


// router.post('/user-bookings/review',async(req,res)=>{
// 	const data = req.body;
// 	const date_ob = new Date();
// 	const schema = Joi.object({
// 	    from_user_id: Joi.required(),
// 	    to_user_id: Joi.required(),
// 	    ratting: Joi.required(),
// 	    review: Joi.required(),
// 	})


//     // validation///////////////////////////////
//    const validationError = schema.validate(req.body);
//    const { value, error } = validationError; 
//    const valid = error == null; 
//    if (!valid) {
//    	return res.status(400).json({'validation_error':validationError.error.details[ 0 ].message});
//    }

//    const post={
//    	from_user_id:data.from_user_id,
//    	to_user_id:data.to_user_id,
//    	ratting:data.ratting,
//    	review:data.review,
//    	created_at:date_ob.toISOString().substring(0,10)
//    };

//    con.query('INSERT INTO review SET ?',post,(err,result)=>{
//    if (!err) {
// 			return res.status(200).json({'success':true,'message':'Data Inserted Successfully'}); 
// 	}else{
// 		return res.status(500).json({message:err});
// 		}
// 	});





// });


// router.get('/user-reviews/:id',async(req,res)=>{
// 	con.query('SELECT * FROM review WHERE ?',{to_user_id:req.params.id},(err,result)=>{
// 		if (!err) {
// 			return res.json({status:200,data:result});
// 		}else{
// 			return res.json({status:500,message:err});
// 		}
// 	})
// });








module.exports = router;