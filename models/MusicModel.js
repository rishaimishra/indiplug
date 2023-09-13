const { DataTypes } = require('sequelize');
const sequelize = require('../database/dbConnect');

const User = sequelize.define('musics', {
    user_id: {
        type: DataTypes.NUMBER 
    },
    file: {
        type: DataTypes.STRING 
    },
    title: {
        type: DataTypes.STRING 
    },

    available_at: {
        type: DataTypes.STRING 
    },

    url: {
        type: DataTypes.STRING 
    },

    cover_photo: {
        type: DataTypes.STRING 
    },
    
},
    
    {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    }); 



module.exports = User;
