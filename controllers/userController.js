var express = require("express");
var router = express.Router();
const pool = require("../config/mysqlConfig");

router.get("/", async function (req, res, next) {
  let query = "SELECT * FROM users";
  const result = await pool.query(query);
  console.log(result);

  //
  res.send("Welcome to the Coupon System API");
});

module.exports = router;
