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
    cb(null,'uploads')
  },
  filename:function(req,file,cb){
  	cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname))
  }
})


var upload = multer({ storage: storage });
var multipleUpload = upload.fields([{name:'music'},{name:'photo'}]);



router.post('/music-upload', multipleUpload, function(req, res) { 
  	const data = req.body;
	const date_ob = new Date();

   var musicName = req.files.music[0].filename;
   if (req.files.photo) {var photoName = req.files.photo[0].filename;}else{var photoName = null};
   

   const post={title:data.title,file:musicName,cover_photo:photoName,user_id:data.user_id,title:data.title,available_at:data.available_at,url:data.url,created_at:date_ob.toISOString().substring(0,10)};

   con.query('INSERT INTO music SET ?',post,(err,result)=>{
   if (!err) {
			return res.status(200).json({'success':true,'message':'Data Inserted Successfully'}); 
	}else{
		return res.status(500).json({message:err});
		}
	});

});

router.get('/all-music-post',async(req,res)=>{
	con.query('SELECT * FROM music',(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});

router.get('/user-music-post/:id',async(req,res)=>{
	con.query('SELECT * FROM music WHERE ?',{user_id:req.params.id},(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});



// delete-post
router.get('/user-music/delete/:id',async(req,res)=>{
	con.query('DELETE FROM music WHERE ?',{id:req.params.id});
	return res.json({status:200,message:'Music Post Deleted Successfully'});
});


// post-details
router.get('/user-music/details/:id',async(req,res)=>{
	con.query('SELECT * FROM music WHERE ?',{id:req.params.id},(err,result)=>{
		if (!err) {
			return res.json({status:200,data:result});
		}else{
			return res.json({status:500,message:err});
		}
	})
});



module.exports = router;