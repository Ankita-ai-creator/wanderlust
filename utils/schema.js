const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().allow("", null)
        }).optional(),
        category: Joi.string()
            .valid("beach", "mountain", "city", "camping", "castle", "lakefront", "skiing", "tropical")
            .allow("", null)
            .optional(),  // ← add this
    }).required()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        reviewer: Joi.string().optional(),
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
});

module.exports = { listingSchema, reviewSchema };