const { z } = require("zod");

// Base schema that includes the `type` field
exports.baseSchema = z.object({
  type: z.enum(["user", "time"], {
    errorMap: () => ({ message: "'type' must be either 'user' or 'time'" }),
  }),
});

// Schema for user-specific coupon
exports.userCouponSchema = baseSchema.extend({
  type: z.literal("user"),
  userId: z.union([z.string(), z.number()], {
    errorMap: () => ({ message: "userId must be a string or number" }),
  }),
  discount: z.number().positive("discount must be greater than 0"),
  code: z.string().min(1, "Required"),
});

exports.timeCouponSchema = baseSchema.extend({
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
