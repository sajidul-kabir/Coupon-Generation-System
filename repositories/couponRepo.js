const e = require("express");
const pool = require("../config/mysqlConfig");
exports.findAllCoupons = async () => {
  const res = await pool.query("SELECT * FROM coupons");

  return res[0];
};
exports.createUserCoupon = async (userId, discount, code) => {
  const [result] = await pool.query(
    "INSERT INTO coupons (type, userId, discount,code) VALUES (?, ?, ?,?)",
    ["USER_SPECIFIC", userId, discount, code]
  );

  return { id: result.insertId, type: "USER_SPECIFIC", userId, discount, code };
};

exports.createTimeCoupon = async (
  discount,
  validFrom,
  validTo,
  maxRedemptions,
  code
) => {
  const [result] = await pool.query(
    "INSERT INTO coupons (type, discount, validFrom, validTo, maxRedemptions,code) VALUES (?, ?, ?, ?, ?,?)",
    ["TIME_SPECIFIC", discount, validFrom, validTo, maxRedemptions, code]
  );

  return {
    id: result.insertId,
    type: "TIME_SPECIFIC",
    discount,
    validFrom,
    validTo,
    maxRedemptions,
    code,
  };
};
exports.getCouponByCode = async (code) => {
  const res = await pool.query("SELECT * FROM coupons WHERE code = ?", [code]);
  return res[0];
};

exports.getUserCountRedemtions = async (couponId, userId) => {
  const res = await pool.query(
    "SELECT COUNT(*) AS redemptionCount FROM coupon_redemptions WHERE userId = ? AND couponId = ?",
    [userId, couponId]
  );
  return res[0][0].redemptionCount;
};
