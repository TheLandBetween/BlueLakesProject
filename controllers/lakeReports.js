const LakeHealthReport = require('../views/models/Lake_Health_Report');
const DO_Temp = require("../views/models/DO_Temp");
const Secchi = require("../views/models/Secchi");
const Phosphorus = require("../views/models/Phosphorous");
const Calcium = require("../views/models/Calcium");

module.exports.index = async (req, res) => {
    // async callback to wait for health lakeReports to be received, then respond with webpage
    const healthReports = await LakeHealthReport.find({}).populate('creator');
    // render index.ejs file with the lakeReports 'database'
    res.render('lakeReports/index', { healthReports, levelDeep: levelDeep = 1});
};

module.exports.renderNewForm = (req, res) => {
    res.render('lakeReports/new', {levelDeep: levelDeep = 1});
};

module.exports.createLakeReport = async (req, res) => {
    // assigns passed in form to a lake health report object, saving to a variable
    console.log(req.body);
    const newReport = new LakeHealthReport(req.body);
    newReport.creator = req.user._id;

    await newReport.save();

    const {temperature, dissolved_oxygen, secchi_depth, phosphorus, calcium} = req.body;

    if (temperature) {
        const {doTempCoordinateX, doTempCoordinateY} = req.body;

        if (Array.isArray(temperature)) {
            for (let i = 0; i < temperature.length; i++) {
                const currDoTemp = new DO_Temp();

                currDoTemp.report_fk = newReport._id;
                currDoTemp.creator = req.user._id;
                currDoTemp.dissolvedOxygen = dissolved_oxygen[i];
                currDoTemp.temperature = temperature[i];
                currDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] };

                console.log(currDoTemp);

                await currDoTemp.save();
            }
        } else {
            const currDoTemp = new DO_Temp();

            currDoTemp.report_fk = newReport._id;
            currDoTemp.creator = req.user._id;
            currDoTemp.dissolvedOxygen = dissolved_oxygen;
            currDoTemp.temperature = temperature;
            currDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] };

            console.log(currDoTemp);

            await currDoTemp.save();
        }
    }

    if (secchi_depth) {
        const {secchiCoordinateX, secchiCoordinateY} = req.body;

        if (Array.isArray(secchi_depth)) {
            for (let i = 0; i < secchi_depth.length; i++) {
                const currSecchi = new Secchi();

                currSecchi.report_fk = newReport._id;
                currSecchi.creator = req.user._id;
                currSecchi.secchi = secchi_depth[i];
                currSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] };

                await currSecchi.save();
            }
        } else {
            const currSecchi = new Secchi();

            currSecchi.report_fk = newReport._id;
            currSecchi.creator = req.user._id;
            currSecchi.secchi = secchi_depth;
            currSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] };

            await currSecchi.save();
        }
    }

    if (phosphorus) {
        const {phosphorusCoordinateX, phosphorusCoordinateY} = req.body;
        if (Array.isArray(phosphorus)) {
            for (let i = 0; i < phosphorus.length; i++) {
                const currPhosphorus = new Phosphorus();

                currPhosphorus.report_fk = newReport._id;
                currPhosphorus.creator = req.user._id;
                currPhosphorus.phosphorus = phosphorus[i];
                currPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] };

                await currPhosphorus.save();
            }
        } else {
            const currPhosphorus = new Phosphorus();

            currPhosphorus.report_fk = newReport._id;
            currPhosphorus.creator = req.user._id;
            currPhosphorus.phosphorus = phosphorus;
            currPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] };

            await currPhosphorus.save();
        }
    }


    if (calcium) {
        const {calciumCoordinateX, calciumCoordinateY} = req.body;

        if (Array.isArray(calcium)) {
            for (let i = 0; i < calcium.length; i++) {
                const currCalcium = new Calcium();

                currCalcium.report_fk = newReport._id;
                currCalcium.creator = req.user._id;
                currCalcium.calcium = calcium[i];
                currCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] };

                await currCalcium.save();
            }
        } else {
            const currCalcium = new Calcium();

            currCalcium.report_fk = newReport._id;
            currCalcium.creator = req.user._id;
            currCalcium.calcium = calcium;
            currCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] };

            await currCalcium.save();
        }
    }

    // save success trigger
    req.flash('success', 'Successfully Created Report');
    // redirect back to view all lakeReports page
    res.redirect(`/lakeReports/${newReport._id}`); // redirect to avoid form resubmission on refresh
};

module.exports.showLakeReport = async (req, res) => {
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const foundReport = await LakeHealthReport.findById(id).populate('creator'); // passing in creator field from
    const foundDoTemp = await DO_Temp.find({report_fk : foundReport._id},{})
    const foundSecchi = await Secchi.find({report_fk : foundReport._id},{})
    const foundPhosphorus = await Phosphorus.find({report_fk : foundReport._id},{})
    const foundCalcium = await Calcium.find({report_fk : foundReport._id},{})

    // send them to the page about the single report
    res.render('lakeReports/details', { foundReport, foundDoTemp, foundSecchi, foundPhosphorus, foundCalcium, levelDeep: levelDeep = 1 });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const lakeReport = await LakeHealthReport.findById(id);
    const foundDoTemp = await DO_Temp.find({report_fk : lakeReport._id},{})
    const foundSecchi = await Secchi.find({report_fk : lakeReport._id},{})
    const foundPhosphorus = await Phosphorus.find({report_fk : lakeReport._id},{})
    const foundCalcium = await Calcium.find({report_fk : lakeReport._id},{})

    if(!lakeReport) {
        req.flash('error', "Could not find that lake report.");
        return res.redirect('/lakeReports');
    }
    res.render("lakeReports/edit", { lakeReport, foundDoTemp, foundSecchi, foundPhosphorus, foundCalcium, levelDeep: levelDeep = 2 });
};

module.exports.updateLakeReport = async (req, res) => {
    const { id } = req.params;
    // find lake report with given id
    const { date_generated, notes, perc_shore_devd } = req.body;
    const lakeReport = await LakeHealthReport.findByIdAndUpdate(id, { date_generated: date_generated, notes: notes, perc_shore_devd: perc_shore_devd});

    const {doTemp_id, secchi_id, phosphorus_id, calcium_id} = req.body;

    if (doTemp_id) {
        const {temperature, dissolved_oxygen, doTempCoordinateX, doTempCoordinateY} = req.body;

        if (Array.isArray(doTemp_id)) { //If array, parse every item
            for (let i = 0; i < doTemp_id.length; i++) {
                if (doTemp_id[i] === "?") { //If no ID is provided, create a new entry
                    const newDoTemp = new DO_Temp();

                    newDoTemp.report_fk = lakeReport._id;
                    newDoTemp.creator = req.user._id;
                    newDoTemp.dissolvedOxygen = dissolved_oxygen[i];
                    newDoTemp.temperature = temperature[i];
                    newDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] };

                    await newDoTemp.save();
                } else { //Otherwise, update existing report
                    const doTempReport = await DO_Temp.findByIdAndUpdate(doTemp_id[i], { dissolvedOxygen: dissolved_oxygen[i], temperature: temperature[i], location: { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] }});
                }
            }
        } else { //If not array, perform singular operation
            if (doTemp_id === "?") { //If no ID is provided, create a new entry
                const newDoTemp = new DO_Temp();

                newDoTemp.report_fk = lakeReport._id;
                newDoTemp.creator = req.user._id;
                newDoTemp.dissolvedOxygen = dissolved_oxygen;
                newDoTemp.temperature = temperature;
                newDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] };

                await newDoTemp.save();
            } else { //Otherwise, update existing report
                const doTempReport = await DO_Temp.findByIdAndUpdate(doTemp_id[i], { dissolvedOxygen: dissolved_oxygen, temperature: temperature, location: { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] }});
            }
        }
    }

    if (secchi_id) {
        const {secchi_depth, secchiCoordinateX, secchiCoordinateY} = req.body;

        if (Array.isArray(secchi_id)) { //If array, parse every item
            for (let i = 0; i < secchi_id.length; i++) {
                if (secchi_id[i] === "?") { //If no ID is provided, create a new entry
                    const newSecchi = new Secchi();

                    newSecchi.report_fk = lakeReport._id;
                    newSecchi.creator = req.user._id;
                    newSecchi.secchi = secchi_depth[i];
                    newSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] };

                    await newSecchi.save();
                } else { //Otherwise, update existing report
                    const secchiReport = await Secchi.findByIdAndUpdate(secchi_id[i], { secchi: secchi_depth[i], location: { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] }});
                }
            }
        } else { //If not array, perform singular operation
            if (secchi_id === "?") { //If no ID is provided, create a new entry
                const newSecchi = new Secchi();

                newSecchi.report_fk = lakeReport._id;
                newSecchi.creator = req.user._id;
                newSecchi.secchi = secchi_depth;
                newSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] };

                await newSecchi.save();
            } else { //Otherwise, update existing report
                const secchiReport = await Secchi.findByIdAndUpdate(secchi_id, { secchi: secchi_depth, location: { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] }});
            }
        }
    }

    if (phosphorus_id) {
        const {phosphorus, phosphorusCoordinateX, phosphorusCoordinateY} = req.body;

        if (Array.isArray(phosphorus_id)) { //If array, parse every item
            for (let i = 0; i < phosphorus_id.length; i++) {
                if (phosphorus_id[i] === "?") { //If no ID is provided, create a new entry
                    const newPhosphorus = new Phosphorus();

                    newPhosphorus.report_fk = lakeReport._id;
                    newPhosphorus.creator = req.user._id;
                    newPhosphorus.phosphorus = phosphorus[i];
                    newPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] };

                    await currPhosphorus.save();
                } else { //Otherwise, update existing report
                    const phosphorusReport = await Phosphorus.findByIdAndUpdate(phosphorus_id[i], { phosphorus: phosphorus[i], location: { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] }});
                }
            }
        } else { //If not array, perform singular operation
            if (phosphorus_id === "?") { //If no ID is provided, create a new entry
                const newPhosphorus = new Phosphorus();

                newPhosphorus.report_fk = lakeReport._id;
                newPhosphorus.creator = req.user._id;
                newPhosphorus.phosphorus = phosphorus;
                newPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] };

                await currPhosphorus.save();
            } else { //Otherwise, update existing report
                const phosphorusReport = await Phosphorus.findByIdAndUpdate(phosphorus_id, { phosphorus: phosphorus, location: { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] }});
            }
        }
    }

    if (calcium_id) {
        const {calcium, calciumCoordinateX, calciumCoordinateY} = req.body;

        if (Array.isArray(calcium_id)) { //If array, parse every item
            for (let i = 0; i < calcium_id.length; i++) {
                if (calcium_id[i] === "?") { //If no ID is provided, create a new entry
                    const newCalcium = new Calcium();

                    newCalcium.report_fk = lakeReport._id;
                    newCalcium.creator = req.user._id;
                    newCalcium.calcium = calcium[i];
                    newCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] };

                    await currCalcium.save();
                } else { //Otherwise, update existing report
                    const calciumReport = await Calcium.findByIdAndUpdate(calcium_id[i], { calcium: calcium[i], location: { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] }});
                }
            }
        } else { //If not array, perform singular operation
            if (calcium_id === "?") { //If no ID is provided, create a new entry
                const newCalcium = new Calcium();

                newCalcium.report_fk = lakeReport._id;
                newCalcium.creator = req.user._id;
                newCalcium.calcium = calcium;
                newCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] };

                await currCalcium.save();
            } else { //Otherwise, update existing report
                const calciumReport = await Calcium.findByIdAndUpdate(calcium_id, { calcium: calcium, location: { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] }});
            }
        }
    }

    req.flash('success', "Successfully updated Lake Report");
    res.redirect(`/lakeReports/${lakeReport._id}`);
};

module.exports.deleteLakeReport = async (req, res) => {
    const { id } = req.params;
    await LakeHealthReport.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted Lake Report");
    res.redirect('/lakeReports');
};