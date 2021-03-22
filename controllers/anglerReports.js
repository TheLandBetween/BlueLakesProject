const AnglerReport = require("../views/models/Angler_Report");

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
    // send them to the page about the single report
    res.render('anglerReports/details', { foundReport, levelDeep: levelDeep = 1 });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const anglerReport = await AnglerReport.findById(id);
    if(!anglerReport) {
        req.flash('error', "Could not find that angler report.");
        return res.redirect('/anglerReports');
    }
    res.render("anglerReports/edit", { anglerReport, levelDeep: levelDeep = 2 });
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