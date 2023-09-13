// const mysql = require("mysql");

// // Create a connection to the database
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "crypto",
//   multipleStatements: true 
// });

// // open the MySQL connection
// connection.connect(error => {
//   if (error) throw error;
//   console.log("Successfully connected to the database.");
// });

// module.exports = connection;



const { Sequelize } = require('sequelize');
const config = require('./dbcred'); 

const connection = new Sequelize(config.database, config.username, config.password, {
    host: "localhost",
    dialect: 'mysql',
    operatorsAliases: 'false',
    logging: false
});  


module.exports = connection