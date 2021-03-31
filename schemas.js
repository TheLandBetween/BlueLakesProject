// for the Joi library, validating submissions server side
const Joi = require('joi');

module.exports.lakeReportSchema = Joi.object({
    // This is where all the Joi validation is done.
    // TODO: this will be changed once we figure out what needs to be actually submitted
    date_generated: Joi.string().required(), // says this must be a string and is required
    notes: Joi.string(),
    perc_shore_devd: Joi.number(),
    temperature: Joi.number(),
    Metric: Joi.string(),
    dissolved_oxygen: Joi.number(),
    secchi_depth: Joi.number(),
    phosphorus: Joi.number(),
    calcium: Joi.number(),

    doTempCoordinateX: Joi.number(),
    doTempCoordinateY: Joi.number(),
    secchiCoordinateX: Joi.number(),
    secchiCoordinateY: Joi.number(),
    phosphorusCoordinateX: Joi.number(),
    phosphorusCoordinateY: Joi.number(),
    calciumCoordinateX: Joi.number(),
    calciumCoordinateY: Joi.number()
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