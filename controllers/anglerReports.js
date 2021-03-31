const AnglerReport = require("../views/models/Angler_Report");
const Fish = require("../views/models/Fish");

module.exports.index = async (req, res) => {
    // async callback to wait for health lakeReports to be received, then respond with webpage
    const anglerReports = await AnglerReport.find({}).populate('creator');
    // render index.ejs file with the lakeReports 'database'
    res.render('anglerReports/index', { anglerReports, levelDeep: levelDeep = 1});
};

module.exports.renderNewForm = (req, res) => {
    res.render('anglerReports/new', {levelDeep: levelDeep = 1});
};

module.exports.createAnglerReport = async (req, res) => {
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new AnglerReport(req.body);

    newReport.creator = req.user._id;
    newReport.angler_name = req.user.firstName + " " + req.user.lastName;

    await newReport.save();

    console.log(req.body);

    if (Array.isArray(req.body.species)) {
        for (let i = 0; i < req.body.species.length; i++) {
            const currFish = new Fish();

            currFish.report_fk = newReport._id;
            currFish.creator = req.user._id;
            currFish.species = req.body.species[i];
            // take path + filename from each image uploaded, add to photo object and append to report
            //currFish.photo = req.files.map(f => ({ url: f.path, filename: f.filename }));

            if (req.body.weight[i]) {
                if (req.body.Weight_Metric === 'imperial') { //Check chosen metrics, convert when needed
                    const conversionRate = 2.20462;
                    currFish.weight = req.body.weight[i] * conversionRate;
                } else
                    currFish.weight = req.body.weight[i];
            }

            if (req.body.length[i]) {
                if (req.body.Length_Metric === 'imperial') {
                    const conversionRate = 2.54;
                    currFish.length = req.body.length[i] * conversionRate;
                } else
                    currFish.length = req.body.length[i];
            }

            console.log(currFish);

            await currFish.save();
        }
    }
    else {
        const currFish = new Fish();

        currFish.report_fk = newReport._id;
        currFish.creator = req.user._id;
        currFish.species = req.body.species;
        // take path + filename from each image uploaded, add to photo object and append to report
        //currFish.photo = req.files.map(f => ({ url: f.path, filename: f.filename }));

        if (req.body.weight) {
            if (req.body.Weight_Metric === 'imperial') { //Check chosen metrics, convert when needed
                const conversionRate = 2.20462;
                currFish.weight = req.body.weight * conversionRate;
            } else
                currFish.weight = req.body.weight;
        }

        if (req.body.length) {
            if (req.body.Length_Metric === 'imperial') {
                const conversionRate = 2.54;
                currFish.length = req.body.length * conversionRate;
            } else
                currFish.length = req.body.length;
        }

        console.log(currFish);

        await currFish.save();
    }

    // save success trigger
    req.flash('success', 'Successfully Created Report');
    // redirect back to view all lakeReports page
    res.redirect(`/anglerReports/${newReport._id}`); // redirect to avoid form resubmission on refresh
};

module.exports.showAnglerReport = async (req, res) => {
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const foundReport = await AnglerReport.findById(id).populate('creator'); // passing in creator field from
    const foundFish = await Fish.find({report_fk : foundReport._id},{})
    console.log(foundFish);
    // send them to the page about the single report
    res.render('anglerReports/details', { foundReport, foundFish, levelDeep: levelDeep = 1 });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundReport = await AnglerReport.findById(id);
    if(!foundReport) {
        req.flash('error', "Could not find that angler report.");
        return res.redirect('/anglerReports');
    }
    const foundFish = await Fish.find({report_fk : foundReport._id},{})


    res.render("anglerReports/edit", { foundReport, foundFish, levelDeep: levelDeep = 2 });
};


module.exports.updateAnglerReport = async (req, res) => {
    const { id } = req.params;
    // find campground with given id
    const anglerReport = await AnglerReport.findByIdAndUpdate(id, { ...req.body });
    req.flash('success', "Successfully updated Angler Report");
    res.redirect(`/anglerReports/${AnglerReport._id}`);
};

module.exports.deleteAnglerReport = async (req, res) => {
    const { id } = req.params;
    await AnglerReport.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted Angler Report");
    res.redirect('/anglerReports');
};