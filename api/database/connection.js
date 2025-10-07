const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'idds_user',
    password: 'idds_pass',
    database: 'idds'
});

pool.getConnection((error, connection) => {
    if (error) {
        console.error('Error connecting to MySQL:', error.message);
    } else {
        console.log('MySQL pool connected as ID', connection.threadId);
        connection.release();
    }
});

module.exports = pool;