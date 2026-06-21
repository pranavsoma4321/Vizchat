const { Client} = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE
});

client.connect((err) => {
    if(err) {
        console.log("Connection error : ", err.stack);
    }
    else{
        console.log("Postgres Connected Successfully");
    }
});

module.exports = client;