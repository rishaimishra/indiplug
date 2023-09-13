const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')


module.exports = function (req,res,next){
	const token = req.header('auth-token');
	if(!token) return res.status(400).json({message:"Token Not Found"});
	try{
		// console.log(process.env.TOKEN_SECRET);
		const verify = jwt.verify(token,process.env.TOKEN_SECRET);
		next();
	}catch(err){
		return res.status(400).json({message:"Invalid Token"});
	}
}