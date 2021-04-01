// for the Joi library, validating submissions server side
const Joi = require('joi');

module.exports.lakeReportSchema = Joi.object({
    // This is where all the Joi validation is done.
    // TODO: this will be changed once we figure out what needs to be actually submitted
    date_generated: Joi.string().required(), // says this must be a string and is required
    notes: Joi.string(),
    perc_shore_devd: Joi.number(),
    temperature: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    Metric: Joi.string(),
    dissolved_oxygen: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    secchi_depth: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    phosphorus: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    calcium: {type: [Joi.number(), Joi.array().items(Joi.number())]},

    doTempCoordinateX: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    doTempCoordinateY: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    secchiCoordinateX: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    secchiCoordinateY: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    phosphorusCoordinateX: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    phosphorusCoordinateY: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    calciumCoordinateX: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    calciumCoordinateY: {type: [Joi.number(), Joi.array().items(Joi.number())]},

    doTemp_id: {type: [Joi.string(), Joi.array().items(Joi.string())]},
    secchi_id: {type: [Joi.string(), Joi.array().items(Joi.string())]},
    phosphorus_id: {type: [Joi.string(), Joi.array().items(Joi.string())]},
    calcium_id: {type: [Joi.string(), Joi.array().items(Joi.string())]}
});

module.exports.anglerReportSchema = Joi.object({
    // This is where all the Joi validation is done.
    // TODO: this will be changed once we figure out what needs to be actually submitted
    // photo: Joi.any(),
    lake: Joi.string().required(),
    municipality: Joi.string().required(),
    date: Joi.date().required(),
    t_start: Joi.string().required(),
    t_end: Joi.string().required(),
});


module.exports.userAccountSchema = Joi.object({
    // expect a lakeReport object to be submitted from the form
    userAccount: Joi.object({
        // This is where all the Joi validation is done.
        username: Joi.string().required(), // says this must be a string and is required
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        password: Joi.number().required()
    }).required()
});