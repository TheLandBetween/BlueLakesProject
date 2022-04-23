// CONTROLLER file - anglerReports
// Purpose is to hold all routing methods corresponding to anglerReports

// import necessary models & functions
const AnglerReport = require("../views/models/Angler_Report");
const Fish = require("../views/models/Fish");
const { cloudinary } = require('../cloudinary');
const { weightConversion, distConversion, saveWeightConversion, saveDistConversion } = require("../public/js/unitConversion.js")

// setup default photo of fish incase user decides not to upload, keeps styling uniform
const defaultFishPhoto = {
    // stock photo uploaded to main cloudinary folder
    url: 'https://res.cloudinary.com/the-land-between/image/upload/v1624334081/BlueLakes/defaultFishPhoto.png',
    filename: 'defaultFishPhoto'
}

// INDEX ROUTE - "/anglerReports"
// Provides user with page displaying all angler reports, passes through all angler reports object

// TODO: Testing conversion of controllers to function containing main methodoly, then two seperate exports for mobile/desktop call.
// intention is to seperate res.render/send from sending just the data to the mobile app, without rewriting whole route

let indexMethod = async (creator) => {
    let anglerReports;
    if (creator !== null) {
        // search DB for user's angler reports, sorting by newest date first
        anglerReports = await AnglerReport.find({creator}).populate('creator').sort({"date": -1});
    } else {
        // search DB for all angler reports, sorting by newest date first
        anglerReports = await AnglerReport.find({}).populate('creator').sort({"date": -1});
    }

    // get list of fish caught for table at top of page, iterate through each fish and add up species
    let fishCounts = await Fish.aggregate([
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

    return { anglerReports, fishCounts }
}
// Desktop INDEX route
module.exports.index = async (req, res) => {
    // rank authorization, ensure user is ranked as an administrator
    if (req.user.rank < 3) {
        // if user is below admin rank, send them back to homepage with a permission error
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/'); //Otherwise reject and redirect to the users home page with error message
    }

    // run index method above, will only be displaying this page to level 3 users so get all requests
    let { anglerReports, fishCounts } = await indexMethod(null);

    // get total number of fish from newest fish
    fishCounts = fishCounts[0]

    // render Angler Report index.ejs file with the angler reports object as well as fishCount object
    res.render('anglerReports/index', { anglerReports, fishCounts} );
};
// Mobile INDEX route
module.exports.mIndex = async (req, res) => {
    console.log('Mobile Lake Request');
    // if currently logged in user is an admin, return all results. if not, return only theirs
    let creator = req.user.rank < 3 ? req.user._id : null;
    let { anglerReports } = await indexMethod(creator);
    res.send({ anglerReports });
}

// NEW ROUTE - "/anglerReports/new"
// Providers user with new angler report entry page
module.exports.renderNewForm = (req, res) => {
    // rank authorization, ensure user is ranked as an administrator
    if (req.user.rank < 3) {
        // if user is below admin rank, send them back to homepage with a permission error
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/'); //Otherwise reject and redirect to the users home page with error message
    }
    // if they are proper rank, send them to new angler report form
    res.render('anglerReports/new');
};

// Helper function for stripping colons on time strings
//   - currTime is current time inputted from user as Str
function removeColons(currTime) {
    // if time is setup as 0:00, split into 0 + 00
    if (currTime.length === 4) {
        currTime = currTime.slice(0, 1) + currTime.slice(2);
    }
    // if time is setup as 00:00 split into 00 + 00
    if (currTime.length === 5) {
        currTime = currTime.slice(0, 2) + currTime.slice(3);
    }
    // return concatenated time without the colon
    return currTime;
}
// Helper function for calculating elapsed time between two points in time
//   - startTime is a time as Str ("0:00"/"00:00")
//   - endTime is a time as Str ("0:00"/"00:00")
function elapsedTimeCalc(startTime, endTime) {
    let returnTime = '';

    let strippedStart = removeColons(startTime);
    let strippedEnd = removeColons(endTime);

    // calculate the hour difference between values
    let hourDiff = Math.floor(strippedEnd/100) - Math.floor(strippedStart/100) - 1;
    // calculate remaining minute difference between the values
    let minDiff = strippedEnd % 100 + (60 - strippedStart % 100);

    // if there are more than 60 minutes remaining increase an hour to the count
    if (minDiff >= 60) {
        hourDiff += 1;
        minDiff = minDiff - 60;
    }

    // return a formatted time string displayed as 0hrs 0min
    returnTime = hourDiff.toString() + "hrs " + minDiff.toString() + "min";
    return returnTime;
}

let createAnglerReportMethod = async () => {

}

// CREATE ROUTE - "/anglerReports
// Receives user's angler report data and posts to the DB with the resulting information.
module.exports.createAnglerReport = async (req, res) => {
    // strip all photos from the entry and add them to a list. one photo per fish
    let fishPics = req.files.map(f => ({url: f.path, filename: f.filename}));
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new AnglerReport(req.body);

    //Appends the anglers user ID and name to the report, is used as a foreign key
    newReport.creator = req.user._id;
    newReport.angler_name = req.user.firstName + " " + req.user.lastName;

    // Figure out and set total elapsed time field using our helper function
    newReport.elapsedTime = elapsedTimeCalc(req.body.t_start, req.body.t_end);

    // gather in all updated photos and put into array to deal with when assigning photos
    let updatedPhotos = req.body.updatedPhotos.split(',').map( Number );

    // Create fish array to be appended to report
    let reportFish = [];

    //Checks if the user submitted one or many fish
    if (Array.isArray(req.body.species)) {
        //If many fish, iterate over each fish. Each field will submit as array so you can iterate over one array, using same position for other attributes
        for (let i = 0; i < req.body.species.length; i++) {
            //Creates a new fish object
            const currFish = new Fish();

            currFish.report_fk = newReport._id; //Parent reports ID
            currFish.creator = req.user._id; //ID of user who submitted the fish
            currFish.species = req.body.species[i]; //Saves species field to fish

            // check to see if user submitted photo for this fish
            if (updatedPhotos.indexOf(i + 1) >= 0) {
                currFish.photo = fishPics[updatedPhotos.indexOf(i + 1)]
            } else {
                // if not assign default values
                currFish.photo = defaultFishPhoto;
            }

            // take path + filename from each image uploaded, add to photo object and append to report
            //currFish.photo = req.files.map(f => ({ url: f.path, filename: f.filename }));
            if (req.body.weight[i]) {
               currFish.weight = saveWeightConversion(req.body.weightPref, req.body.weight[i])
            }

            //Length conversion based on user input, saves metric in database
            if (req.body.length[i]) {
                currFish.length = saveDistConversion(req.body.distPref, req.body.length[i])
            }

            //Saves the fish object to the database
            await currFish.save();

            // append to final fish array for report entry
            reportFish.push(currFish);
        }
    }
    // if not, just a single fish submitted
    else {
        // create a new Fish object
        const currFish = new Fish();

        // Assign parents report ID, parent users ID, and species of the fish caught
        currFish.report_fk = newReport._id;
        currFish.creator = req.user._id;
        currFish.species = req.body.species;

        // check if user uploaded a photo for fish
        if (fishPics.length > 0) {
            // if they did, assign it to the current fish
            currFish.photo = fishPics[0]
        } else {
            // if they didn't upload a photo, assign this fish to the default fish photo
            currFish.photo = defaultFishPhoto;
        }

        // if a weight was inputted (which has to be anyway client side, just server validation)
        if (req.body.weight) {
            // convert it using our weight conversion helper function based off the current user's preference & save to fish
            currFish.weight = saveWeightConversion(req.body.weightPref, req.body.weight)
        }
        // same as above for length, using our length conversion helper function
        if (req.body.length) {
            currFish.length = saveDistConversion(req.body.distPref, req.body.length)
        }

        //Saves the fish to the database
        await currFish.save();

        // append to final fish array for report entry
        reportFish.push(currFish);
    }

    newReport.fish = reportFish;

    //Saves the report to the database
    await newReport.save();

    // save success trigger to pass on alert to user
    req.flash('success', 'Successfully Created Report');
    // redirect back to view angler report page (avoiding refresh)
    res.redirect(`/anglerReports/${newReport._id}`);
};
module.exports.mCreateAnglerReport = async (req, res) => {
    // Pull uploaded photos from multer middleware
    let fishPics = req.files.map(f => ({url: f.path, filename: f.filename}));

    // create new angler report based on information passed in
    const { lakeName, municipality, date, timeIn, timeOut, species, length, weight, fishCount } = req.body;
    const newReport = new AnglerReport({lake: lakeName, municipality, date, fishCount});

    // Pull generated string submitted with form indicating which fish included an uploaded photo
    let updatedPhotos = req.body.updatedPhotos.split(',').map( Number );

    // find the first colon, go back two char
    let tIndex = timeIn.indexOf(':') - 2;
    // let tIndex = startTime.indexOf('T' + 2);
    let formattedStart = timeIn.substr(tIndex, 5);
    let formattedEnd = timeOut.substr(tIndex, 5);

    newReport.t_start = formattedStart;
    newReport.t_end = formattedEnd;
    newReport.elapsedTime = elapsedTimeCalc(formattedStart, formattedEnd);

    // set creator link and angler name based off of currently signed in user
    newReport.creator = req.user._id;
    newReport.angler_name = req.user.firstName + " " + req.user.lastName;

    let reportFish = [];

    if (Array.isArray(species)) {
        for (let i = 0; i < species.length; i++) {
            //Creates a new fish object
            const currFish = new Fish();

            currFish.report_fk = newReport._id; //Parent reports ID
            currFish.creator = req.user._id; //ID of user who submitted the fish
            currFish.species = species[i]; //Saves species field to fish

            // check to see if user submitted photo for this fish
            if (updatedPhotos.indexOf(i) >= 0) {
                currFish.photo = fishPics[updatedPhotos.indexOf(i)]
            } else {
                // if not assign default values
                currFish.photo = defaultFishPhoto;
            }

            // take path + filename from each image uploaded, add to photo object and append to report
            //currFish.photo = req.files.map(f => ({ url: f.path, filename: f.filename }));
            if (weight[i]) {
                currFish.weight = saveWeightConversion(req.user.weightPref, weight[i])
            }

            //Length conversion based on user input, saves metric in database
            if (length[i]) {
                currFish.length = saveDistConversion(req.user.distPref, length[i])
            }

            //Saves the fish object to the database
            await currFish.save();

            // append to final fish array for report entry
            reportFish.push(currFish);
        }
    } else {
        // create a new Fish object
        const currFish = new Fish();

        // Assign parents report ID, parent users ID, and species of the fish caught
        currFish.report_fk = newReport._id;
        currFish.creator = req.user._id;
        currFish.species = species;

        // check if user uploaded a photo for fish
        if (fishPics.length > 0) {
        //     // if they did, assign it to the current fish
            currFish.photo = fishPics[0]
        } else {
            // if they didn't upload a photo, assign this fish to the default fish photo
            currFish.photo = defaultFishPhoto;
        }

        // if a weight was inputted (which has to be anyway client side, just server validation)
        if (weight) {
            // convert it using our weight conversion helper function based off the current user's preference & save to fish
            currFish.weight = saveWeightConversion(req.user.weightPref, weight)
        }
        // same as above for length, using our length conversion helper function
        if (length) {
            currFish.length = saveDistConversion(req.user.distPref, length)
        }

        //Saves the fish to the database
        await currFish.save();

        // append to final fish array for report entry
        reportFish.push(currFish);
    }

    newReport.fish = reportFish;
    await newReport.save();

    res.send('success');
}

// SHOW ROUTE -- "/anglerReports/:id/"
// Providers user with page displaying information from single angler report
module.exports.showAnglerReport = async (req, res) => {
    // pull id of angler report from url
    const { id } = req.params;
    console.log(id)
    // look up the angler report corresponding to the id passed in to the url
    const foundReport = await AnglerReport.findById(id).populate('creator'); // passing in creator field from
    const foundFish = await Fish.find({report_fk : foundReport._id},{})
    // send them to the page about the single report
    res.render('anglerReports/details', { foundReport, foundFish, weightConversion, distConversion });
};
module.exports.showAnglerReportMobile = async (req, res) => {
    console.log('mobile show request')
    const { id } = req.params;
    console.log('id: ', id);
    console.log(req.params.id);
    const foundReport = await AnglerReport.findById(id).populate('creator'); // passing in creator field from
    const foundFish = await Fish.find({report_fk : foundReport._id},{})
    res.send({ foundFish })
}

// EDIT ROUTE -- "/anglerReports/:id/edit"
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

// UPDATE ROUTE -- "/anglerReports/:id"
// Purpose: Update a existing angler report on edit submission and save changes to DB
module.exports.updateAnglerReport = async (req, res) => {
    //Gets the report ID from the URL
    const { id } = req.params;
    // Pull form entries from body of submission
    const {lake, municipality, date, t_start, t_end} = req.body;
    // Search for Angler Report based on ID and update corresponding fields
    const anglerReport = await AnglerReport.findByIdAndUpdate(id, { lake: lake, municipality: municipality, date: date, t_start: t_start, t_end: t_end }); //Updates the angler report with the new values

    // update current reports fish count
    let reportFishCount = anglerReport.fishCount;
    // pull new fish count
    let newFishCount = reportFishCount;

    // extract all photos submitted from form and append to array
    let fishPics = req.files.map(f => ({url: f.path, filename: f.filename}));
    // pull fishId from body of form, to see if any submitted
    const {fish_id} = req.body;

    // gather in all updated photos and put into array to deal with when assigning photos
    let updatedPhotos = req.body.updatedPhotos.split(',').map( Number );

    // if there are multiple fish
    if (fish_id) {
        // pull species, length, and weight fields from form (will be in array form if multiple submissions)
        const { species, length, weight} = req.body;
        // set current fish counter index
        let fishCounter = 0;

        // if there are multiple fish submitted, need to iterate over everything for each fish
        if (Array.isArray(fish_id)) {
            // iterate over once for each fish
            for (let i = 0; i < fish_id.length; i++) {
                // if current fish has no id (didn't exist in report beforehand) then create a new entry
                if (fish_id[i] === "?") {
                    // create new fish mongo object
                    const newFish = new Fish();

                    newFish.report_fk = anglerReport._id; //Parent angler report foreign key
                    newFish.creator = req.user._id; //ID of user who logged the fish
                    newFish.species = species[i]; //All information about the fish
                    // TODO: WEIGHT / DISTANCE CONVERSIONS?
                    newFish.length = length[i];
                    newFish.weight = weight[i];
                    // if user uploads photo for fish assign it
                    if (updatedPhotos.indexOf(i + 1) >= 0) {
                        newFish.photo = fishPics[updatedPhotos.indexOf(i + 1)];
                    } else {
                        // if not, assign default photo
                        newFish.photo = defaultFishPhoto;
                    }
                    // save new fields to fish object
                    await newFish.save();

                    // update fishCount on angler report due to newly added fish
                    newFishCount = newFishCount + 1;
                } else {
                    //Otherwise, locate fish in DB and update fields for it
                    const newFish = await Fish.findByIdAndUpdate(fish_id[i], { species: species[i], length: length[i], weight: weight[i]});
                    // if current fish number has had its photo updated
                    // will be checking + 1 as fishID's start at 0
                    if(updatedPhotos.indexOf(i + 1) >= 0) {
                        // assign photo to corresponding entry in photo array based by multer
                        newFish.photo = fishPics[updatedPhotos.indexOf(i + 1)];
                        newFish.save();
                    }
                }
                // increase fish counter
                fishCounter += 1;
            }
        } else { //If not array, only need to go through that functionality once
            // if current fish has no id (didn't exist in report beforehand) then create a new entry
            if (fish_id === "?") {
                // create new Fish mongo object
                const newFish = new Fish();

                newFish.report_fk = anglerReport._id; //Parent angler report foreign key
                newFish.creator = req.user._id; //ID of user who logged the fish
                newFish.species = species; //All information about the fish
                // TODO: WEIGHT / DISTANCE CONVERSIONS?
                newFish.length = length;
                newFish.weight = weight;

                // if user uploads photo for fish assign it
                if (fishPics.length > 0) {
                    newFish.photo = fishPics[0]
                } else {
                    // if not, assign default photo
                    newFish.photo = defaultFishPhoto;
                }
                // save mongo object with new information
                await newFish.save();

                // update fishCount on angler report due to newly added fish
                newFishCount = newFishCount + 1;
            } else { //Otherwise, update existing report
                // locate fish in DB and update newly entered fields
                const newFish = await Fish.findByIdAndUpdate(fish_id, { species: species, length: length, weight: weight});
                // if current fish number has had its photo updated, update the photo for mongodb fish entry
                if (fishPics.length > 0) {
                    newFish.photo = fishPics[0];
                    newFish.save();
                }
            }
        }
    }

    // if new fish have been added, reflect on report fish count in DB
    if (newFishCount > reportFishCount) {
        anglerReport.fishCount = newFishCount;
        anglerReport.save();
    }

    // after everything has completed, send to newly created report page with flash success message
    req.flash('success', "Successfully updated Angler Report");
    res.redirect(`/anglerReports/${anglerReport._id}`); //Redirect the user to the updated report
};

// DESTROY ROUTE -- "/anglerReports/:id
// Purpose: Delete angler report from DB & corresponding photos from cloudinary
module.exports.deleteAnglerReport = async (req, res) => {
    // pull report ID from the URL
    const { id } = req.params;

    // Delete the report itself from the ID passed in
    await AnglerReport.findByIdAndDelete(id);

    // Find all fish included in that parent report
    let foundFish = await Fish.find({report_fk: id});

    // iterate over each fish
    foundFish.forEach(fish => {
        // iterate over each photo for the current fish
        fish.photo.forEach(photo => {
            // delete from cloudinary
            cloudinary.uploader.destroy(photo.filename);
        })
    })

    // Delete all fish associated with the parent angler report
    await Fish.deleteMany({report_fk: id})

    // After successful completion, redirect to all reports with success flash message
    req.flash('success', "Successfully deleted Angler Report");
    res.redirect('/anglerReports');
};
