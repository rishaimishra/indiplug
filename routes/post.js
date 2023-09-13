const express = require('express');
const router = express.Router();
const con = require('../connection');
const Joi = require('joi'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const verify = require('./verifyToken');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');


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
      cb(uploadError,path.join(__dirname, '../post/'))
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-') 
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })

const uploadOptions = multer({ storage: storage })


// post add
router.post('/add-post',uploadOptions.single('media'),async(req,res)=>{
	const data = req.body;
	const date_ob = new Date();
	const schema = Joi.object({
	    description: Joi.required(),
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

   const post={description:data.description,media:fileName,user_id:data.user_id,created_at:date_ob.toISOString().substring(0,10)};
   con.query('INSERT INTO post SET ?',post,(err,result)=>{
   if (!err) {
			return res.status(200).json({'success':true,'message':'Post Inserted Successfully'}); 
	}else{
					return res.status(500).json({message:err});
				}
	});
});


// all-post of all users
router.get('/all-post',async(req,res)=>{
	con.query('SELECT * FROM post',(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});


// specific user post

router.get('/user-post/:id',async(req,res)=>{
	con.query('SELECT * FROM post WHERE ?',{user_id:req.params.id},(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});


// delete-post
router.get('/user-post/delete/:id',async(req,res)=>{
	con.query('DELETE FROM post WHERE ?',{id:req.params.id});
	return res.json({status:200,message:'Post Deleted Successfully'});
});


// post-details
router.get('/user-post/details/:id',async(req,res)=>{
	con.query('SELECT * FROM post WHERE ?',{id:req.params.id},(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});









module.exports = router;