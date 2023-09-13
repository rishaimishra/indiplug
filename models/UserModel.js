const { DataTypes } = require('sequelize');
const sequelize = require('../database/dbConnect');

const User = sequelize.define('users', {
    name: {
        type: DataTypes.STRING 
    },
    email: {
        type: DataTypes.STRING 
    },
    password: {
        type: DataTypes.STRING 
    },
    otp: {
        type: DataTypes.STRING 
    },

    phone: {
        type: DataTypes.STRING 
    },
    role: {
        type: DataTypes.STRING 
    },
    status: {
        type: DataTypes.STRING 
    },
    genre: {
        type: DataTypes.STRING 
    },
    location: {
        type: DataTypes.STRING 
    },
    bio: {
        type: DataTypes.STRING 
    },
    image: {
        type: DataTypes.STRING 
    },
},
    
    {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    }); 



module.exports = User;
