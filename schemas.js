// for the Joi library, validating submissions server side
const Joi = require('joi');

module.exports.lakeReportSchema = Joi.object({
    // This is where all the Joi validation is done.
    // TODO: this will be changed once we figure out what needs to be actually submitted
    date_generated: Joi.string().required(), // says this must be a string and is required
    notes: Joi.string().required(),
    perc_shore_devd: Joi.number().required(),
    avg_temp: Joi.number().required(),
    Metric: Joi.string().required(),
    avg_do_conc: Joi.number().required(),
    avg_secchi_depth: Joi.number().required(),
    avg_phosph: Joi.number().required()
});

module.exports.anglerReportSchema = Joi.object({
    // This is where all the Joi validation is done.
    // TODO: this will be changed once we figure out what needs to be actually submitted
    photo: Joi.any(),
    lake: Joi.string().required(),
    municipality: Joi.string().required(),
    date: Joi.date().required(),
    t_start: Joi.string().required(),
    t_end: Joi.string().required(),
    species: Joi.string().required(),
    length: Joi.number().allow(null, ''),
    Length_Metric: Joi.string(),
    weight: Joi.number().allow(null, ''),
    Weight_Metric: Joi.string()
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