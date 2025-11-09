const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

let pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "CouponSystem",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
console.log("database connected");
pool = pool.promise();

module.exports = pool;
