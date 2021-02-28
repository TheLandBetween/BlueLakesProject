// for the Joi library, validating submissions server side
const Joi = require('joi');

module.exports.lakeReportSchema = Joi.object({
    // expect a lakeReport object to be submitted from the form
    lakeReport: Joi.object({
        // This is where all the Joi validation is done.
        // TODO: this will be changed once we figure out what needs to be actually submitted
        date_generated: Joi.string().required(), // says this must be a string and is required
        status: Joi.string().required(),
        summary: Joi.string().required(),
        level_of_concern: Joi.number().required().min(0).max(10), // level of concern must be a number between 0 and 10
        perc_shore_devd: Joi.number().required(),
        avg_temp: Joi.number().required(),
        Metric: Joi.string().required(),
        avg_do_conc: Joi.number().required(),
        avg_secchi_depth: Joi.number().required(),
        avg_phosph: Joi.number().required()
    }).required()
});
