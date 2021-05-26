// for the Joi library, validating submissions server side
const Joi = require('joi');

module.exports.lakeReportSchema = Joi.object({
    date_generated: Joi.date().required(), // says this must be a string and is required
    notes: Joi.string().required(),
    perc_shore_devd: Joi.number().required(),

    // Dissolved Oxygen
    doTemp_id: Joi.any().optional(), // only if multiple
    temperature: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    dissolved_oxygen: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    doTempCoordinateX: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    doTempCoordinateY: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    doTempDepth: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),

    // Secchi
    secchi_id: Joi.any().optional(), // only if multiple
    secchi_depth: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    secchiCoordinateX: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    secchiCoordinateY: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    secchiDepth: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),

    // Phosphorous
    phosphorus_id: Joi.any().optional(), // only if multiple
    phosphorus: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    phosphorusCoordinateX: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    phosphorusCoordinateY: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),

    // Calcium
    calcium_id: Joi.any().optional(), // only if multiple
    calcium: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    calciumCoordinateX: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    calciumCoordinateY: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
});


module.exports.anglerReportSchema = Joi.object({
    lake: Joi.string(),
    municipality: Joi.string(),
    date: Joi.date(),
    t_start: Joi.string(),
    t_end: Joi.string(),
    // Fish Information, gets transferred as single input field with many entries (array)
    species: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    length: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    weight: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    fish_id: Joi.any().optional() // will only show up if > 1 fish
});


module.exports.userAccountSchema = Joi.object({
    // This is where all the Joi validation is done.
    username: Joi.string(), // says this must be a string and is required
    firstName: Joi.string(),
    lastName: Joi.string(),
    organization: Joi.string().optional().allow('').default("No Organization"),
    password: Joi.string(),
    distPref: Joi.string(),
    weightPref: Joi.string()
});

