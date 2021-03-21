const LakeHealthReport = require('../views/models/Lake_Health_Report');

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
    const newReport = new LakeHealthReport(req.body);
    newReport.creator = req.user._id;
    await newReport.save();
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
    // send them to the page about the single report
    res.render('lakeReports/details', { foundReport, levelDeep: levelDeep = 1 });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const lakeReport = await LakeHealthReport.findById(id);
    if(!lakeReport) {
        req.flash('error', "Could not find that lake report.");
        return res.redirect('/lakeReports');
    }
    res.render("lakeReports/edit", { lakeReport, levelDeep: levelDeep = 2 });
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