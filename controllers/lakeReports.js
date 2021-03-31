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

    const numTempDoReports = 123;

    if(!lakeReport) {
        req.flash('error', "Could not find that lake report.");
        return res.redirect('/lakeReports');
    }
    res.render("lakeReports/edit", { lakeReport, foundDoTemp, foundSecchi, foundPhosphorus, foundCalcium, numTempDoReports, levelDeep: levelDeep = 2 });
};

module.exports.updateLakeReport = async (req, res) => {
    const { id } = req.params;
    // find campground with given id
    const lakeReport = await LakeHealthReport.findByIdAndUpdate(id, { ...req.body });
    req.flash('success', "Successfully updated Lake Report");
    res.redirect(`/lakeReports/${lakeReport._id}`);
};

module.exports.deleteLakeReport = async (req, res) => {
    const { id } = req.params;
    await LakeHealthReport.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted Lake Report");
    res.redirect('/lakeReports');
};