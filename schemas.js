// for the Joi library, validating submissions server side
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
})

// include custom XSS html sanitize
const Joi = BaseJoi.extend(extension)

module.exports.lakeReportSchema = Joi.object({
    date_generated: Joi.date().required(), // says this must be a string and is required
    notes: Joi.string().required().escapeHTML(),
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
    lake: Joi.string().required().escapeHTML(),
    municipality: Joi.string().required().escapeHTML(),
    date: Joi.date().required(),
    t_start: Joi.string().required().escapeHTML(),
    t_end: Joi.string().required().escapeHTML(),
    // Fish Information, gets transferred as single input field with many entries (array)
    species: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    length: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    weight: Joi.alternatives().try(Joi.number(), Joi.array().items(Joi.number())),
    fish_id: Joi.any().optional() // will only show up if > 1 fish
});


module.exports.userAccountSchema = Joi.object({
    // This is where all the Joi validation is done.
    username: Joi.string().required().escapeHTML(), // says this must be a string and is required
    firstName: Joi.string().required().escapeHTML(),
    lastName: Joi.string().required().escapeHTML(),
    organization: Joi.string().optional().allow('').default("No Organization").escapeHTML(),
    password: Joi.string().required().escapeHTML(),
    distPref: Joi.string().required().escapeHTML(),
    weightPref: Joi.string().required().escapeHTML()
});

