const { DataTypes } = require('sequelize');
const sequelize = require('../database/dbConnect');

const User = sequelize.define('posts', {
    user_id: {
        type: DataTypes.NUMBER 
    },
    media: {
        type: DataTypes.STRING 
    },
    description: {
        type: DataTypes.STRING 
    },
    
},
    
    {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    }); 



module.exports = User;
