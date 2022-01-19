// CONTROLLER file - Lake Health Reports
// Purpose is to hold all routing methods corresponding to Lake Health Reports

// import necessary models & functions
const LakeHealthReport = require('../views/models/Lake_Health_Report');
const DO_Temp = require("../views/models/DO_Temp");
const Secchi = require("../views/models/Secchi");
const Phosphorus = require("../views/models/Phosphorous");
const Calcium = require("../views/models/Calcium");

// INDEX ROUTE -- "/lakeReports"
const indexMethod = async (creator) => {
    let healthReports;
    if (creator !== null) {
        healthReports = await LakeHealthReport.find({creator}).populate('creator').sort({"date_generated": -1});
    } else {
        healthReports = await LakeHealthReport.find({}).populate('creator').sort({"date_generated": -1});
    }

    return { healthReports }
}
// Purpose: Provide user with index page displaying all lake health reports
module.exports.index = async (req, res) => {
    // Ensure user is administrator as default users should only be able to see their own
    if (req.user.rank < 3) {
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }
    // async callback to wait for health lakeReports to be received, then respond with webpage
    let { healthReports } = await indexMethod(null);
    // render index.ejs file with the lakeReports 'database'
    res.render('lakeReports/index', { healthReports });
};
module.exports.mIndex = async (req, res) => {
    let creator = req.user.rank < 3 ? req.user._id : null;
    let { healthReports } = await indexMethod(creator);

    res.send({ healthReports });
}
// NEW ROUTE -- "/lakeReports/new"
// Purpose: Renders the form to create a new lake report
module.exports.renderNewForm = (req, res) => {
    // Ensure user is administrator as default users should only be able to see their own
    if (req.user.rank < 3) {
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }
    res.render('lakeReports/new');
};

// CREATE ROUTE -- "/lakeReports"
// Purpose: Receives lake report information from form submission and enters it into the DB
module.exports.createLakeReport = async (req, res) => {
    // TODO: Seems like this should be a middleware thing, like an isAuthorized that checks their role and what they're submitting
    // Authorization check, ensure user is level 2 indicating they can submit lake health reports (will block anglers)
    if (req.user.rank < 2) {
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new LakeHealthReport(req.body);
    //Assign the reports creator
    newReport.creator = req.user._id;

    //Get each attribute field from the submitted form body
    const {temperature, dissolved_oxygen, secchi_depth, phosphorus, calcium} = req.body;

    // Check user submitted any temperature readings
    if (temperature) {
        //Get rest of associated DoTemp attributes
        const {doTempCoordinateX, doTempCoordinateY, doTempDepth} = req.body;
        // instantiate readings array to hold list if multiple
        let tempReadings = [];

        //Check if many temperature reports were submitted or if just one
        if (Array.isArray(temperature)) {
            // if multiple, iterate x times where x is number of seperate temperature readings
            for (let i = 0; i < temperature.length; i++) {
                // create new dissolved oxygen temperature object
                const currDoTemp = new DO_Temp();

                currDoTemp.report_fk = newReport._id; //Assign parent report foreign key
                currDoTemp.creator = req.user._id; //Assign user ID
                currDoTemp.dissolvedOxygen = dissolved_oxygen[i]; //Assign rest of attributes to the currDoTemp report
                // TODO: Conversion middleware thing?
                currDoTemp.temperature = temperature[i];
                currDoTemp.depth = doTempDepth[i];
                //Coordinates object (/views/models)
                currDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] };

                //Save report object to the database
                await currDoTemp.save();
                // push current reading to the master readings list
                tempReadings.push(currDoTemp);
            }
        } else { // Single temperature report submission, no array just single reading for each
            // create new dissolved oxygen temperature object
            const currDoTemp = new DO_Temp();

            currDoTemp.report_fk = newReport._id; //Assign parent report foreign key
            currDoTemp.creator = req.user._id; //Assign user ID
            currDoTemp.dissolvedOxygen = dissolved_oxygen; //Assign rest of attributes to the currDoTemp report
            // TODO: Conversion middleware thing?
            currDoTemp.temperature = temperature;
            currDoTemp.depth = doTempDepth;
            //Coordinates object (/views/models)
            currDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] };

            //Save report object to database
            await currDoTemp.save();
            // push current reading to the master readings list
            tempReadings.push(currDoTemp);
        }
        // append all temp readings to current report
        newReport.doTemp = tempReadings;
    }

    // Check user submitted any secchi depth readings
    if (secchi_depth) {
        //Get rest of associated secchi attributes
        const {secchiCoordinateX, secchiCoordinateY, secchiDepth} = req.body;
        // instatiate array for all secchi depth readings taken
        let secchiReadings = [];

        // check to see if multiple secchi reports submitted or just one
        if (Array.isArray(secchi_depth)) {
            // if many, iterate over each one submitted
            for (let i = 0; i < secchi_depth.length; i++) {
                //TODO: This code seems duplicated, could put this in a function and have it run here as well as single value. would reduce code lines
                // create new secchi object
                const currSecchi = new Secchi();

                // append corresponding values
                currSecchi.report_fk = newReport._id; //Assign parent report foreign key
                currSecchi.creator = req.user._id; //Assign user ID
                currSecchi.secchi = secchi_depth[i]; //Assign rest of attributes to the secchi report
                // TODO: Conversion middleware thing?
                currSecchi.depth = secchiDepth[i];
                currSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] };

                //Save secchi object to database
                await currSecchi.save();
                // push current reading to the master readings list
                secchiReadings.push(currSecchi);
            }
        } else { // Single Secchi reading submitted, only need to create single object
            // instatiate secchi object
            const currSecchi = new Secchi();

            // Append corresponding values
            currSecchi.report_fk = newReport._id; //Assign parent report foreign key
            currSecchi.creator = req.user._id; //Assign user ID
            currSecchi.secchi = secchi_depth; //Assign rest of attributes to the secchi report
            // TODO: Conversion middleware thing?
            currSecchi.depth = secchiDepth;
            currSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] };

            //Save secchi object to database
            await currSecchi.save();
            // push current reading to the master readings list
            secchiReadings.push(currSecchi);
        }
        // save secchi readings to current report
        newReport.secchi_depth = secchiReadings;
    }

    // Check user submitted any phosphorous readings
    if (phosphorus) {
        //Get rest of associated phosphorus attributes
        const {phosphorusCoordinateX, phosphorusCoordinateY} = req.body;
        // instatiate array for all secchi depth readings taken
        let phosphReadings = [];

        // Check if many phosphorus readings were submitted or just one
        if (Array.isArray(phosphorus)) {
            //If many, iterate over each phosphorus
            for (let i = 0; i < phosphorus.length; i++) {
                // create new phosphorous object
                const currPhosphorus = new Phosphorus();

                // assign corresponding variables
                currPhosphorus.report_fk = newReport._id; //Assign parent report foreign key
                currPhosphorus.creator = req.user._id; //Assign user ID
                currPhosphorus.phosphorus = phosphorus[i]; //Assign rest of attributes to the phosphorus report
                currPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] };

                // Save phosphorous object to database
                await currPhosphorus.save();
                // push current reading to the master readings list
                phosphReadings.push(currPhosphorus);
            }
        } else { //Single phosphorus reading was submitted
            // create new phosphorous object
            const currPhosphorus = new Phosphorus();

            // assign corresponding variables
            currPhosphorus.report_fk = newReport._id; //Assign parent report foreign key
            currPhosphorus.creator = req.user._id; //Assign user ID
            currPhosphorus.phosphorus = phosphorus; //Assign rest of attributes to the phosphorus report
            currPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] };

            //Save phosphorous objects to database
            await currPhosphorus.save();
            // push current reading to the master readings list
            phosphReadings.push(currPhosphorus);
        }
        // add phosph readings to the current lake health report
        newReport.phosphorus = phosphReadings;
    }

    // Check user submitted any calcium readings
    if (calcium) {
        // If yes, get rest of associated calcium attributes
        const {calciumCoordinateX, calciumCoordinateY} = req.body;
        // instatiate array for all secchi depth readings taken
        let calciumReadings = [];

        // Check if many calcium reports were submitted or if it was just one
        if (Array.isArray(calcium)) {
            // If multiple, iterate over each calcium
            for (let i = 0; i < calcium.length; i++) {
                // create new calcium object
                const currCalcium = new Calcium();

                // Assign corresponding variables
                currCalcium.report_fk = newReport._id; //Assign parent report foreign key
                currCalcium.creator = req.user._id; //Assign user ID
                currCalcium.calcium = calcium[i]; //Assign rest of attributes to the phosphorus report
                currCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] };

                //Save calcium object to database
                await currCalcium.save();
                // At this point it will have been succesfully saved, so push to final readings
                calciumReadings.push(currCalcium)
            }
        } else { //Single calcium report is submitted
            // create new calcium object
            const currCalcium = new Calcium();

            // Assign corresponding variables
            currCalcium.report_fk = newReport._id; //Assign parent report foreign key
            currCalcium.creator = req.user._id; //Assign user ID
            currCalcium.calcium = parseInt(calcium); //Assign rest of attributes to the phosphorus report
            currCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] };

            //Save calcium object to database
            await currCalcium.save();
            // At this point it will have been succesfully saved, so push to final readings
            calciumReadings.push(currCalcium);
        }
        // add all calcium readings to current report
        newReport.calcium = calciumReadings;
    }

    //Save the report to the database
    await newReport.save();

    // save success trigger
    req.flash('success', 'Successfully Created Report');
    // redirect back to view single lakeReports page
    res.redirect(`/lakeReports/${newReport._id}`); // redirect to avoid form resubmission on refresh
};
module.exports.mCreateLakeReport = async (req, res) => {
    const { date, notes, perc_shore_devd, doTemp, secchi, phosph, calcium } = req.body;
    const newReport = new LakeHealthReport({ date_generated: date, notes, perc_shore_devd })
    newReport.creator = req.user._id;

    // Place to save created readings and link them to our final report
    let doTempReadings = [];
    let secchiReadings = [];
    let phosphReadings = [];
    let calciumReadings = [];

    if (doTemp && doTemp.length > 0) {
        for (const currDoTemp of doTemp) {
            const { dissolvedOxygen, temperature, depth, location } = currDoTemp;
            const doTempEntry = new DO_Temp({ dissolvedOxygen, temperature, depth })
            // deal with location

            // Parent reports ID
            doTempEntry.report_fk = newReport._id;
            // ID of user who submitted form
            doTempEntry.creator = req.user._id;

            await doTempEntry.save();

            // push reading to list of doTemps for parent report
            doTempReadings.push(doTempEntry);
        }
    }
    if (secchi && secchi.length > 0) {
        for (const currSecchi of secchi) {
            const { secchi, depth, location } = currSecchi;
            const secchiEntry = new Secchi({ secchi, depth })
            // deal with location

            // Parent reports ID
            secchiEntry.report_fk = newReport._id;
            // ID of user who submitted form
            secchiEntry.creator = req.user._id;

            await secchiEntry.save();

            // push reading to list of secchi for parent report
            secchiReadings.push(secchiEntry);
        }
    }
    if (phosph && phosph.length > 0) {
        for (const currPhosph of phosph) {
            const { phosph, location } = currPhosph;
            const phosphEntry = new Phosphorus({ phosphorus: phosph })
            // deal with location

            // Parent reports ID
            phosphEntry.report_fk = newReport._id;
            // ID of user who submitted form
            phosphEntry.creator = req.user._id;

            await phosphEntry.save();

            // push reading to list of phosph for parent report
            phosphReadings.push(phosphEntry);
        }
    }
    if (calcium && calcium.length > 0) {
        for (const currCalcium of calcium) {
            const { calcium, location } = currCalcium;
            const calciumEntry = new Calcium({ calcium })
            // deal with location

            // Parent reports ID
            calciumEntry.report_fk = newReport._id;
            // ID of user who submitted form
            calciumEntry.creator = req.user._id;

            await calciumEntry.save();

            // push reading to list of calcium for parent report
            calciumReadings.push(calciumEntry);
        }
    }

    // link final readings to parent report
    newReport.doTemp = doTempReadings;
    newReport.secchi_depth = secchiReadings;
    newReport.phosphorus = phosphReadings;
    newReport.calcium = calciumReadings;

    // save report to DB
    await newReport.save();

    res.send('success');
};

// SHOW ROUTE -- "/lakeReport/:id"
// Purpose: Render single lake report page with details of current report
module.exports.showLakeReport = async (req, res) => {
    // Authentication check, ensure user is at least level 2 (deny angler's)
    if (req.user.rank < 2) {
        //If not, redirect to home page and display rejection message
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    // passing in creator field, allows you to access associated "creator" object properties with .populate
    const foundReport = await LakeHealthReport.findById(id).populate('creator');
    //Get all associated DO_Temp reports
    const foundDoTemp = await DO_Temp.find({report_fk : foundReport._id},{});
    //Get all associated Secchi reports
    const foundSecchi = await Secchi.find({report_fk : foundReport._id},{});
    //Get all associated Phosphorus reports
    const foundPhosphorus = await Phosphorus.find({report_fk : foundReport._id},{});
    //Get all associated Calcium reports
    const foundCalcium = await Calcium.find({report_fk : foundReport._id},{});

    // send them to the page about the single report, page will render all the data
    res.render('lakeReports/details', { foundReport, foundDoTemp, foundSecchi, foundPhosphorus, foundCalcium });
};

// EDIT ROUTE -- "/lakeReports/:id/edit"
// Purpose: Render the edit report page with the current report details filled in
module.exports.renderEditForm = async (req, res) => {
    // Authentication check, ensure user is at least level 2 (deny angler's)
    if (req.user.rank < 2) {
        //If not, redirect to home page and display rejection message
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const lakeReport = await LakeHealthReport.findById(id);
    //Get all associated DO_Temp reports
    const foundDoTemp = await DO_Temp.find({report_fk : lakeReport._id},{});
    //Get all associated Secchi reports
    const foundSecchi = await Secchi.find({report_fk : lakeReport._id},{});
    //Get all associated Phosphorus reports
    const foundPhosphorus = await Phosphorus.find({report_fk : lakeReport._id},{});
    //Get all associated Calcium reports
    const foundCalcium = await Calcium.find({report_fk : lakeReport._id},{});

    //If the desired report doesnt exist, redirect to the home page
    if(!lakeReport) {
        req.flash('error', "Could not find that lake report.");
        return res.redirect('/lakeReports');
    }
    res.render("lakeReports/edit", { lakeReport, foundDoTemp, foundSecchi, foundPhosphorus, foundCalcium }); //Otherwise render edit page
};

// UPDATE ROUTE -- "/lakeReports/:id"
// Purpose: Update a lake health report upon edit report submission with submitted form data
module.exports.updateLakeReport = async (req, res) => {
    // Authentication check, ensure user is at least level 2 (deny angler's)
    if (req.user.rank < 2) {
        //If not, redirect to home page and display rejection message
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }

    // find lake report with given id
    const { id } = req.params;

    //Get all other fields associated with the LakeHealthReport object
    const { date_generated, notes, perc_shore_devd } = req.body;
    //Update the object itself
    const lakeReport = await LakeHealthReport.findByIdAndUpdate(
        id,
        { date_generated: date_generated, notes: notes, perc_shore_devd: perc_shore_devd}
    );

    //Now proceed to update each of its child fields
    const {doTemp_id, secchi_id, phosphorus_id, calcium_id} = req.body;

    //Check if doTemp report updates were submitted
    if (doTemp_id) {
        //If they were, get the rest of the associated fields
        const {temperature, dissolved_oxygen, doTempCoordinateX, doTempCoordinateY, doTempDepth} = req.body;

        // Check if many were submitted, items will be in an array
        if (Array.isArray(doTemp_id)) {
            //If there were many, need to iterate over each doTemp submitted and update accordingly
            for (let i = 0; i < doTemp_id.length; i++) {
                //If no ID is provided, create a new entry as this is new submission to the report
                if (doTemp_id[i] === "?") {
                    // create new dissolved oxygen object
                    const newDoTemp = new DO_Temp();

                    // assign corresponding values
                    newDoTemp.report_fk = lakeReport._id; //Assign parent report foreign key
                    newDoTemp.creator = req.user._id; //Assign user ID
                    newDoTemp.dissolvedOxygen = dissolved_oxygen[i]; //Assign rest of attributes to the DoTemp report
                    // TODO: unit conversion middleware?
                    newDoTemp.temperature = temperature[i];
                    newDoTemp.depth = doTempDepth[i];
                    newDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] };

                    //Save the new dissolved oxygen object to the DB
                    await newDoTemp.save();
                } else { //If not a new part of the report, update existing report using associated ID
                    const doTempReport = await DO_Temp.findByIdAndUpdate(doTemp_id[i], {
                        dissolvedOxygen: dissolved_oxygen[i],
                        temperature: temperature[i],
                        depth: doTempDepth[i],
                        location: { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]]
                    }});
                }
            }
        } else { //If single report is submitted, fields will not be submitted as array, process individually
            // if no ID provided on current entry it's a new field
            if (doTemp_id === "?") {
                // create new dissolved oxygen object
                const newDoTemp = new DO_Temp();

                // assign corresponding values
                newDoTemp.report_fk = lakeReport._id; //Assign parent report foreign key
                newDoTemp.creator = req.user._id; //Assign user ID
                newDoTemp.dissolvedOxygen = dissolved_oxygen; //Assign rest of attributes to the DoTemp report
                // TODO: Unit conversions
                newDoTemp.temperature = temperature;
                newDoTemp.depth = doTempDepth;
                newDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] };

                //Save the new dissolved oxygen object
                await newDoTemp.save();
            } else { //Otherwise, update existing report using associated ID
                const doTempReport = await DO_Temp.findByIdAndUpdate(doTemp_id, {
                    dissolvedOxygen: dissolved_oxygen,
                    temperature: temperature,
                    depth: doTempDepth,
                    location: { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY]
                }});
            }
        }
    }

    //Check if secchi report updates were submitted
    if (secchi_id) {
        //If they were, get the rest of the associated fields
        const {secchi_depth, secchiCoordinateX, secchiCoordinateY, secchiDepth} = req.body;

        //Check if many were submitted, items will be in an array
        if (Array.isArray(secchi_id)) {
            // If there are, iterate over each secchi reading
            for (let i = 0; i < secchi_id.length; i++) {
                // If no ID is provided, create a new entry
                if (secchi_id[i] === "?") {
                    // create new secchi object
                    const newSecchi = new Secchi();

                    // assign corresponding objects
                    newSecchi.report_fk = lakeReport._id; //Assign parent report foreign key
                    newSecchi.creator = req.user._id; //Assign user ID
                    newSecchi.secchi = secchi_depth[i]; //Assign rest of attributes to the secchi report
                    // TODO: unit conversions
                    newSecchi.depth = secchiDepth[i];
                    newSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] };

                    //Save new secchi object to the db
                    await newSecchi.save();
                } else { //Otherwise, update existing report using associated ID
                    const secchiReport = await Secchi.findByIdAndUpdate(secchi_id[i], {
                        secchi: secchi_depth[i],
                        depth: secchiDepth[i],
                        location: { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]]
                    }});
                }
            }
        } else { //If not array, perform singular operation
            //If no ID is provided, create a new entry
            if (secchi_id === "?") {
                // create new secchi object
                const newSecchi = new Secchi();

                // assign corresponding objects
                newSecchi.report_fk = lakeReport._id; //Assign parent report foreign key
                newSecchi.creator = req.user._id; //Assign user ID
                newSecchi.secchi = secchi_depth; //Assign rest of attributes to the secchi report
                // TODO: unit conversions
                newSecchi.depth = secchiDepth;
                newSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] };

                //Save new secchi object to db
                await newSecchi.save();
            } else { //Otherwise, update existing report using associated ID
                const secchiReport = await Secchi.findByIdAndUpdate(secchi_id, { secchi: secchi_depth, depth: secchiDepth, location: { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] }});
            }
        }
    }

    // Check if phosphorus field updates were submitted
    if (phosphorus_id) {
        // If they were, get the rest of the associated fields
        const {phosphorus, phosphorusCoordinateX, phosphorusCoordinateY} = req.body;

        // Check if many were submitted, items will be in an array
        if (Array.isArray(phosphorus_id)) {
            // If there are, iterate over each phosphorous reading
            for (let i = 0; i < phosphorus_id.length; i++) {
                //If no ID is provided, create a new entry
                if (phosphorus_id[i] === "?") {
                    // create new phosphorous object
                    const newPhosphorus = new Phosphorus();

                    // assign corresponding values
                    newPhosphorus.report_fk = lakeReport._id; //Assign parent report foreign key
                    newPhosphorus.creator = req.user._id; //Assign user ID
                    newPhosphorus.phosphorus = phosphorus[i]; //Assign rest of attributes to the phosphorus report
                    newPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] };

                    //Save new phoshporous object to db
                    await newPhosphorus.save();
                } else { //Otherwise, update existing report using associated ID
                    const phosphorusReport = await Phosphorus.findByIdAndUpdate(phosphorus_id[i], {
                        phosphorus: phosphorus[i],
                        location: { type: 'Point',
                            coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]]
                    }});
                }
            }
        } else { //If not array, perform singular operation
            //If no ID is provided, create a new entry
            if (phosphorus_id === "?") {
                // create new phosphorous object
                const newPhosphorus = new Phosphorus();

                // assign corresponding values
                newPhosphorus.report_fk = lakeReport._id; //Assign parent report foreign key
                newPhosphorus.creator = req.user._id; //Assign user ID
                newPhosphorus.phosphorus = phosphorus; //Assign rest of attributes to the phosphorus report
                newPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] };

                //Save new phoshporous object to db
                await newPhosphorus.save();
            } else { //Otherwise, update existing report using associated ID
                const phosphorusReport = await Phosphorus.findByIdAndUpdate(phosphorus_id, {
                    phosphorus: phosphorus,
                    location: { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY]
                }});
            }
        }
    }

    //Check if calcium report updates were submitted
    if (calcium_id) {
        //If they were, get the rest of the associated fields
        const {calcium, calciumCoordinateX, calciumCoordinateY} = req.body;

        // Check if many were submitted, items will be in an array
        if (Array.isArray(calcium_id)) {
            // If there are, iterate over each calcium reading
            for (let i = 0; i < calcium_id.length; i++) {
                //If no ID is provided, create a new entry
                if (calcium_id[i] === "?") {
                    // create new calcium object
                    const newCalcium = new Calcium();

                    // assign corresponding values
                    newCalcium.report_fk = lakeReport._id; //Assign parent report foreign key
                    newCalcium.creator = req.user._id; //Assign user ID
                    newCalcium.calcium = calcium[i]; //Assign rest of attributes to the calcium report
                    newCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] };

                    //Save new calcium object to DB
                    await newCalcium.save();
                } else { //Otherwise, update existing report using associated ID
                    const calciumReport = await Calcium.findByIdAndUpdate(calcium_id[i], {
                        calcium: calcium[i],
                        location: { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]]
                    }});
                }
            }
        } else { //If not array, perform singular operation
            //If no ID is provided, create a new entry
            if (calcium_id === "?") {
                // create new calcium object
                const newCalcium = new Calcium();

                // assign corresponding values
                newCalcium.report_fk = lakeReport._id; //Assign parent report foreign key
                newCalcium.creator = req.user._id; //Assign user ID
                newCalcium.calcium = calcium; //Assign rest of attributes to the calcium report
                newCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] };

                //Save new calcium object to DB
                await newCalcium.save();
            } else { //Otherwise, update existing report using associated ID
                const calciumReport = await Calcium.findByIdAndUpdate(calcium_id, { calcium: calcium,
                    location: { type: 'Point',
                        coordinates: [calciumCoordinateX, calciumCoordinateY]
                }});
            }
        }
    }

    // after everything has finished successfully, send user to created report page with success flash
    req.flash('success', "Successfully updated Lake Report");
    res.redirect(`/lakeReports/${lakeReport._id}`);
};

// DELETE ROUTE - Lake Report
// Purpose: Delete a lake report from the DB
module.exports.deleteLakeReport = async (req, res) => {
    // Authentication check, ensure user is at least level 2 (deny angler's)
    if (req.user.rank < 2) {
        //If user doesn't have correct rank, reject and redirect to home page
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }

    // Get report ID from URL
    const { id } = req.params;
    // Lookup & delete from database
    await LakeHealthReport.findByIdAndDelete(id);

    // Redirect user with success message once completed
    req.flash('success', "Successfully deleted Lake Report");
    res.redirect('/lakeReports');
};
