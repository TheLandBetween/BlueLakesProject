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
    doTempDepth: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    secchiCoordinateX: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    secchiCoordinateY: {type: [Joi.number(), Joi.array().items(Joi.number())]},
    secchiDepth: {type: [Joi.number(), Joi.array().items(Joi.number())]},
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
    lake: Joi.string().required(),
    municipality: Joi.string().required(),
    date: Joi.date().required(),
    t_start: Joi.string().required(),
    t_end: Joi.string().required(),
    // Fish Information, gets transferred as single input field with many entries (array)
    species: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
    length: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.number())).required(),
    weight: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.number())).required(),
    fish_id: Joi.any().optional() // will only show up if > 1 fish
});


module.exports.userAccountSchema = Joi.object({
    // This is where all the Joi validation is done.
    username: Joi.string().required(), // says this must be a string and is required
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    organization: Joi.string().optional().allow('').default("No Organization"),
    password: Joi.string().required(),
    distPref: Joi.string().required(),
    weightPref: Joi.string().required()
});

