const express = require('express');
const router = express.Router();
const con = require('../connection');
const Joi = require('joi'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const verify = require('./verifyToken');
const multer  = require('multer');
const MusicModel = require('../models/MusicModel');
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


router.post('/music-upload', multipleUpload, async(req,res)=> { 
  	const data = req.body;
	const date_ob = new Date();

   var musicName = req.files.music[0].filename;
   if (req.files.photo) {var photoName = req.files.photo[0].filename;}else{var photoName = null};
   

   const post={title:data.title,file:musicName,cover_photo:photoName,user_id:data.user_id,title:data.title,available_at:data.available_at,url:data.url,created_at:date_ob.toISOString().substring(0,10)};

   const music = await MusicModel.create({
    title:data.title,
    file:musicName,
    cover_photo:photoName,
    user_id:data.user_id,
    title:data.title,
    available_at:data.available_at,
    url:data.url
   });
   return res.status(200).json({'success':true,'message':'Data Inserted Successfully'}); 


});

router.get('/all-music-post',async(req,res)=>{
	const allMusic = await MusicModel.findAll();
    return res.json({status:200,data:allMusic});
});

router.get('/user-music-post/:id',async(req,res)=>{
	const music = await MusicModel.findAll({
        where:{
            user_id:req.params.id,
            status:['A','I'],
        }
    });
    return res.json({status:200,data:music});
});


router.get('/user-music/delete/:id',async(req,res)=>{
	const update = await MusicModel.update(
                { status: "D", },
                { where: { id: req.params.id } }
            );
    return res.status(200).json({ message: "Post Deleted Successfully", code: 200 });
});

router.get('/user-music/details/:id',async(req,res)=>{
	const post = await MusicModel.findAll({
        where:{
            id:req.params.id,
            status:['A','I'],
        }
    });
    return res.json({status:200,data:post});
});



module.exports = router;