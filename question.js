const mysql=require("mysql");
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"123456",
    database:"quiz_game",
});
const BASE_URL=process.env.BASE_URL;

connection.connect(function(err) {
    if (err) {
      console.error('Error connecting to database:', err.stack);
      return;
    }
    console.log('Connected to database as ID:', connection.threadId);
  
    connection.query('SHOW TABLES', function(err, results, fields) {
      if (err) {
        console.error('Error fetching tables:', err.stack);
        return;
      }
  
      const tableNames = results.map(result => result[Object.keys(result)[0]]);

      console.log('Tables in the database:', tableNames);
    });
});

module.exports = connection;
