const { z } = require("zod");

const createPropertySchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
    propertyName: z.string().optional(),
    propertyType: z.string().optional(),
    purpose: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    facing: z.string().optional(),
    entrance: z.string().optional(),
    livingRoomDirection: z.string().optional(),
    kitchenDirection: z.string().optional(),
    masterBedroomDirection: z.string().optional(),
    kidsBedroomDirection: z.string().optional(),
    bathroomDirection: z.string().optional(),
    poojaRoomDirection: z.string().optional(),
    notes: z.string().optional(),
  }),
});

module.exports = {
  createPropertySchema,
};
