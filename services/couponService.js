const res = require("express/lib/response");
const couponRepo = require("../repositories/couponRepo");
exports.listAllCoupons = async (req, res) => {
  const result = await couponRepo.findAllCoupons();
  return result;
};

exports.generateUserCoupon = async (userId, discount, code) => {
  // Logic to generate a user-specific coupon
  return couponRepo.createUserCoupon(userId, discount, code);
};
exports.generateTimeCoupon = async (
  discount,
  validFrom,
  validTo,
  maxRedemptions,
  code
) => {
  // Logic to generate a time-specific coupon
  return couponRepo.createTimeCoupon(
    discount,
    validFrom,
    validTo,
    maxRedemptions,
    code
  );
};

exports.validateCoupon = async (code, userId) => {
  const couponExists = await couponRepo.getCouponByCode(code);
  console.log(couponExists);
  let result = {};

  if (couponExists.length === 0) {
    return (result = { valid: false, message: "Coupon does not exist" });
  }

  const coupon = couponExists[0];
  if (coupon.type === "USER_SPECIFIC") {
    if (coupon.userId != userId) {
      return (result = {
        valid: false,
        message: "Coupon is not valid for this user",
      });
    }
    if (coupon.redeemed >= 1) {
      return (result = {
        valid: false,
        message: "Coupon has already been redeemed",
      });
    }
    if (coupon.redeemed === 0) {
      return { valid: true, message: "Coupon Valid" };
    }
  }

  if (coupon.type === "TIME_SPECIFIC") {
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);
    const now = new Date();

    // Convert everything to *local time values*
    const nowLocal = now.getTime();
    const validFromLocal = validFrom.getTime();
    const validToLocal = validTo.getTime();

    console.log({
      now: now.toString(),
      validFrom: validFrom.toString(),
      validTo: validTo.toString(),
      nowLocal,
      validFromLocal,
      validToLocal,
    });

    if (nowLocal < validFromLocal || nowLocal > validToLocal) {
      return { valid: false, message: "Coupon is expired or not yet valid" };
    }

    const userRedeemCount = await couponRepo.getUserCountRedemtions(
      coupon.id,
      userId
    );
    console.log(userRedeemCount);

    if (userRedeemCount >= coupon.maxRedemptions) {
      return (result = {
        valid: false,
        message: "Coupon has reached its maximum redemptions",
      });
    } else {
      return { valid: true, message: "Coupon Valid" };
    }
  }
  return {};
};
