var express = require("express");
var router = express.Router();
const couponService = require("../services/couponService");
const { z } = require("zod");

// Base schema that includes the `type` field
const baseSchema = z.object({
  type: z.enum(["user", "time"], {
    errorMap: () => ({ message: "'type' must be either 'user' or 'time'" }),
  }),
});

// Schema for user-specific coupon
const userCouponSchema = baseSchema.extend({
  type: z.literal("user"),
  userId: z.union([z.string(), z.number()], {
    errorMap: () => ({ message: "userId must be a string or number" }),
  }),
  discount: z.number().positive("discount must be greater than 0"),
  code: z.string().min(1, "Required"),
});

const timeCouponSchema = baseSchema.extend({
  type: z.literal("time"),
  discount: z.number().positive("discount must be greater than 0"),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "validFrom must be a valid date string",
  }),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "validTo must be a valid date string",
  }),
  code: z.string().min(1, "Required"),
  maxRedemptions: z.number().int().positive("maxRedemptions must be positive"),
});

const validateCouponSchema = z.object({
  code: z.string().min(1, "Code is required"),
  userId: z.union([z.string(), z.number()]).optional(),
});

router.get("/", async function (req, res, next) {
  try {
    console.log("here");

    const result = await couponService.listAllCoupons();
    return res.status(200).json(result);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
router.post("/", async function (req, res) {
  try {
    const body = req.body;

    const parsedType = baseSchema.safeParse(body);
    if (!parsedType.success) {
      return res
        .status(400)
        .json({ message: parsedType.error.errors[0].message });
    }

    let coupon;
    if (body.type === "user") {
      const parsedBody = userCouponSchema.parse(body);

      coupon = await couponService.generateUserCoupon(
        parsedBody.userId,
        parsedBody.discount,
        parsedBody.code
      );
    } else if (body.type === "time") {
      const parsedBody = timeCouponSchema.parse(body);
      coupon = await couponService.generateTimeCoupon(
        parsedBody.discount,
        parsedBody.validFrom,
        parsedBody.validTo,
        parsedBody.maxRedemptions,
        parsedBody.code
      );
    }

    return res.status(201).json(coupon);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err,
      });
    }

    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/validate", async (req, res) => {
  try {
    const parsedBody = validateCouponSchema.parse(req.body);

    let result = await couponService.validateCoupon(
      parsedBody.code,
      parsedBody.userId
    );
    console.log(result);

    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
