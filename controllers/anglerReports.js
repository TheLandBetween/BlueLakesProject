const AnglerReport = require("../views/models/Angler_Report");
const Fish = require("../views/models/Fish");

//Index to view all reports
module.exports.index = async (req, res) => {
    if (req.user.rank < 3) { //Acount must be rank 3 (Administrator) for the process to execute
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/'); //Otherwise reject and redirect to the users home page with error message
    }
    // async callback to wait for health anglerReports to be received, then respond with webpage
    const anglerReports = await AnglerReport.find({}).populate('creator').sort({"date": -1}); //Gets all reports, sorts by newest date
    let fishCounts = await Fish.aggregate([ //Counts the number of each species of fish to display at the top of the page
        { "$unwind" : "$species" },
        { "$group": { "_id": "$species", "count": { "$sum": 1} } },
        { "$group": {
            "_id": null,
                "counts": {
                "$push": {
                    "k": "$_id",
                    "v": "$count"
                }
            }
        } },
        { "$replaceRoot": {
            "newRoot": { "$arrayToObject": "$counts" }
        } }
    ]);

    console.log(fishCounts[0]);
    fishCounts = fishCounts[0]

    // render index.ejs file with the lakeReports 'database'
    res.render('anglerReports/index', { anglerReports, fishCounts} ); //Renders the page with all reports and fish counts passed through
};

//Renders form to submit new angler report
module.exports.renderNewForm = (req, res) => {
    res.render('anglerReports/new');
};

// Helper function for stripping colons on time strings
function removeColons(x) {
    if (x.length === 4) {
        x = x.slice(0, 1) + x.slice(2);
    }

    if (x.length === 5) {
        x = x.slice(0, 2) + x.slice(3);
    }

    return x;
}

function elapsedTimeCalc(startTime, endTime) {
    let strippedStart = removeColons(startTime);
    let strippedEnd = removeColons(endTime);
    let hourDiff = Math.floor(strippedEnd/100) - Math.floor(strippedStart/100) - 1;
    let minDiff = strippedEnd % 100 + (60 - strippedStart % 100);

    if (minDiff >= 60) {
        hourDiff += 1;
        minDiff = minDiff - 60;
    }

    return hourDiff.toString() + "hrs " + minDiff.toString() + "min";
}

//Executes once a new angler report is submitted
module.exports.createAnglerReport = async (req, res) => {
    // strip all photos from the entry and add them to a list. one photo per fish
    let fishPics = req.files.map(f => ({url: f.path, filename: f.filename}));
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new AnglerReport(req.body);

    //Appends the anglers user ID and name to the report, can be used as a foreign key
    newReport.creator = req.user._id;
    newReport.angler_name = req.user.firstName + " " + req.user.lastName;

    // Figure out and set total elapsed time field
    newReport.elapsedTime = elapsedTimeCalc(req.body.t_start, req.body.t_end);

    await newReport.save(); //Saves the report to the database, fish are not saved in the report object, but rather associated through a foreign key report ID

    if (Array.isArray(req.body.species)) { //Checks if the user submitted one or many fish
        for (let i = 0; i < req.body.species.length; i++) { //If many fish, iterate over each fish.  Each field will submit as array so you can iterate over one array, using same position for other attributes
            const currFish = new Fish(); //Creates a new fish object

            currFish.report_fk = newReport._id; //Parent reports ID
            currFish.creator = req.user._id; //ID of user who submitted the fish
            currFish.species = req.body.species[i]; //Saves species field to fish
            currFish.photo = fishPics[i]  // get current image and assign to fish as only one allowed per upload
            // take path + filename from each image uploaded, add to photo object and append to report
            //currFish.photo = req.files.map(f => ({ url: f.path, filename: f.filename }));
            //TODO: This is weight conversion, needs to be linked to profile
            //Weight conversion based on user input, saves metric in database
            if (req.body.weight[i]) {
                if (req.body.Weight_Metric === 'imperial') { //Check chosen metrics, convert when needed
                    const conversionRate = 2.20462; //KG to Lb ratio
                    currFish.weight = req.body.weight[i] * conversionRate;
                } else
                    currFish.weight = req.body.weight[i];
            }

            //Length conversion based on user input, saves metric in database
            if (req.body.length[i]) {
                if (req.body.Length_Metric === 'imperial') {
                    const conversionRate = 2.54; //Inch to cm ratio
                    currFish.length = req.body.length[i] * conversionRate;
                } else
                    currFish.length = req.body.length[i];
            }

            await currFish.save(); //Saves the fish object to the database
        }
    }
    else { //Just a single fish submitted
        const currFish = new Fish();

        currFish.report_fk = newReport._id; //Parent reports ID
        currFish.creator = req.user._id; //ID of user who submitted the fish
        currFish.species = req.body.species; //Species of the caught fish from user input
        currFish.photo = fishPics[0] // since one fish upload first corresponding photo
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

        await currFish.save(); //Saves the fish to the database
    }

    // save success trigger
    req.flash('success', 'Successfully Created Report');
    // redirect back to view angler report page
    res.redirect(`/anglerReports/${newReport._id}`); // redirect to avoid form resubmission on refresh
};

//Renders page to view a single report
module.exports.showAnglerReport = async (req, res) => {
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const foundReport = await AnglerReport.findById(id).populate('creator'); // passing in creator field from
    const foundFish = await Fish.find({report_fk : foundReport._id},{})
    // send them to the page about the single report
    res.render('anglerReports/details', { foundReport, foundFish });
};

//Renders page to edit a existing angler report
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params; //ID is gathered from the URL
    const foundReport = await AnglerReport.findById(id); //Search for the entry in the database
    if(!foundReport) { //If the report is not found, notify and redirect the user to their angler reports
        req.flash('error', "Could not find that angler report.");
        return res.redirect('/anglerReports');
    }
    const foundFish = await Fish.find({report_fk : foundReport._id},{}) //If report exists, find all fish associated with the report


    res.render("anglerReports/edit", { foundReport, foundFish }); //Render the page
};

//Update a existing angler report on edit submission
module.exports.updateAnglerReport = async (req, res) => {
    const { id } = req.params; //Gets the report ID from the URL
    // find angler report with given id
    const {lake, municipality, date, t_start, t_end} = req.body; //Gets values associated with the Angler Report object
    const anglerReport = await AnglerReport.findByIdAndUpdate(id, { lake: lake, municipality: municipality, date: date, t_start: t_start, t_end: t_end }); //Updates the angler report with the new values

    let fishPics = req.files.map(f => ({url: f.path, filename: f.filename}));
    const {fish_id} = req.body;

    // gather in all updated photos and put into array to deal with when assigning photos
    let updatedPhotos = req.body.updatedPhotos.split(',').map( Number );

    console.log('Updated Fish Photos: ', updatedPhotos);
    console.log('photos: ', fishPics);

    if (fish_id) {
        const { species, length, weight} = req.body;
        let fishCounter = 0;

        if (Array.isArray(fish_id)) { //If array, parse every item
            for (let i = 0; i < fish_id.length; i++) {
                if (fish_id[i] === "?") { //If no ID is provided, create a new entry
                    const newFish = new Fish();

                    newFish.report_fk = anglerReport._id; //Parent angler report foreign key
                    newFish.creator = req.user._id; //ID of user who logged the fish
                    newFish.species = species[i]; //All information about the fish
                    newFish.length = length[i];
                    newFish.weight = weight[i];
                    // if user uploads photo for fish assign it
                    if (updatedPhotos.indexOf(i + 1) >= 0) {
                        newFish.photo = fishPics[updatedPhotos.indexOf(i + 1)];
                    }
                    await newFish.save();
                } else { //Otherwise, update existing report
                    const newFish = await Fish.findByIdAndUpdate(fish_id[i], { species: species[i], length: length[i], weight: weight[i]});
                    // if current fish number has had its photo updated
                    // will be checking + 1 as fishID's start at 0
                    if(updatedPhotos.indexOf(i + 1) >= 0) {
                        // assign photo to corresponding entry in photo array based by multer
                        newFish.photo = fishPics[updatedPhotos.indexOf(i + 1)];
                        newFish.save();
                    }
                }
                fishCounter += 1;
            }
        } else { //If not array, perform singular operation
            if (fish_id === "?") { //If no ID is provided, create a new entry
                const newFish = new Fish();

                newFish.report_fk = anglerReport._id; //Parent angler report foreign key
                newFish.creator = req.user._id; //ID of user who logged the fish
                newFish.species = species; //All information about the fish
                newFish.length = length;
                newFish.weight = weight;
                if (fishPics.length > 0) {
                    newFish.photo = fishPics[0]
                }
                await newFish.save();
            } else { //Otherwise, update existing report
                const newFish = await Fish.findByIdAndUpdate(fish_id, { species: species, length: length, weight: weight});
                if (fishPics.length > 0) {
                    newFish.photo = fishPics[0];
                    newFish.save();
                }
            }
        }
    }

    req.flash('success', "Successfully updated Angler Report");
    res.redirect(`/anglerReports/${anglerReport._id}`); //Redirect the user to the updated report
};

//Delete angler report method
module.exports.deleteAnglerReport = async (req, res) => {
    const { id } = req.params; //Gets report ID from the URL
    await AnglerReport.findByIdAndDelete(id); //Finds the report by ID and deletes it from the database.  No need to communicate with the angler report object itself.
    req.flash('success', "Successfully deleted Angler Report");
    res.redirect('/anglerReports');
};
