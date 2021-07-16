const LakeHealthReport = require('../views/models/Lake_Health_Report');
const DO_Temp = require("../views/models/DO_Temp");
const Secchi = require("../views/models/Secchi");
const Phosphorus = require("../views/models/Phosphorous");
const Calcium = require("../views/models/Calcium");

module.exports.index = async (req, res) => {
    if (req.user.rank < 3) {
        req.flash('error', "Your account doesn't have permission.");
        return res.redirect('/');
    }
    // async callback to wait for health lakeReports to be received, then respond with webpage
    const healthReports = await LakeHealthReport.find({}).populate('creator').sort({"date_generated": -1});
    // render index.ejs file with the lakeReports 'database'
    res.render('lakeReports/index', { healthReports });
};

//Renders the page to create a new lake report
module.exports.renderNewForm = (req, res) => {
    res.render('lakeReports/new');
};

//On new lake report submission, creates a new lake health report
module.exports.createLakeReport = async (req, res) => {
    // TODO: Seems like this should be a middleware thing, like an isAuthorized that checks their role and what they're submitting
    if (req.user.rank < 2) { //Check if the users rank is less than 2 (only researchers and anglers can access this method)
        req.flash('error', "Your account doesn't have permission."); //If user is a Angler, reject and redirect
        return res.redirect('/');
    }
    // assigns passed in form to a lake health report object, saving to a variable
    const newReport = new LakeHealthReport(req.body);
    newReport.creator = req.user._id; //Assign the reports creator

    const {temperature, dissolved_oxygen, secchi_depth, phosphorus, calcium} = req.body; //Get each attribute field from the table

    if (temperature) { //Check user submitted the field, if yes execute, otherwise move to next attribute
        const {doTempCoordinateX, doTempCoordinateY, doTempDepth} = req.body; //Get rest of associated DoTemp attributes
        let tempReadings = [];

        if (Array.isArray(temperature)) { //Check if many DoTemp reports were submitted
            for (let i = 0; i < temperature.length; i++) { //Iterate over each report
                const currDoTemp = new DO_Temp();

                currDoTemp.report_fk = newReport._id; //Assign parent report foreign key
                currDoTemp.creator = req.user._id; //Assign user ID
                currDoTemp.dissolvedOxygen = dissolved_oxygen[i]; //Assign rest of attributes to the currDoTemp report
                currDoTemp.temperature = temperature[i];
                currDoTemp.depth = doTempDepth[i];
                currDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] }; //Coordinates object (/views/models)

                await currDoTemp.save(); //Save report to database]
                tempReadings.push(currDoTemp);
            }
        } else { //Single report, no array just single reading for each
            const currDoTemp = new DO_Temp();

            currDoTemp.report_fk = newReport._id; //Assign parent report foreign key
            currDoTemp.creator = req.user._id; //Assign user ID
            currDoTemp.dissolvedOxygen = dissolved_oxygen; //Assign rest of attributes to the currDoTemp report
            currDoTemp.temperature = temperature;
            currDoTemp.depth = doTempDepth;
            currDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] }; //Coordinates object (/views/models)

            await currDoTemp.save(); //Save report to database
            tempReadings.push(currDoTemp);
        }
        // append all temp readings to current report
        newReport.doTemp = tempReadings;
    }

    if (secchi_depth) { //Check user submitted the field, if yes execute, otherwise move to next attribute
        const {secchiCoordinateX, secchiCoordinateY, secchiDepth} = req.body; //Get rest of associated secchi attributes
        //secchi_depth is the secchi reading value, secchiDepth is the depth the reading was measured at
        let secchiReadings = [];
        if (Array.isArray(secchi_depth)) { //Check if many secchi were submitted
            for (let i = 0; i < secchi_depth.length; i++) { //Iterate over each submitted secchi
                const currSecchi = new Secchi();

                currSecchi.report_fk = newReport._id; //Assign parent report foreign key
                currSecchi.creator = req.user._id; //Assign user ID
                currSecchi.secchi = secchi_depth[i]; //Assign rest of attributes to the secchi report
                currSecchi.depth = secchiDepth[i];
                currSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] };

                await currSecchi.save(); //Save report to database
                secchiReadings.push(currSecchi);
            }
        } else { //Single secchi submitted
            const currSecchi = new Secchi();

            currSecchi.report_fk = newReport._id; //Assign parent report foreign key
            currSecchi.creator = req.user._id; //Assign user ID
            currSecchi.secchi = secchi_depth; //Assign rest of attributes to the secchi report
            currSecchi.depth = secchiDepth;
            currSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] };

            await currSecchi.save();
            secchiReadings.push(currSecchi);
        }
        // save secchi readings to current report
        newReport.secchi_depth = secchiReadings;
    }

    if (phosphorus) { //Check user submitted the field, if yes execute, otherwise move to next attribute
        const {phosphorusCoordinateX, phosphorusCoordinateY} = req.body; //Get rest of associated phosphorus attributes
        let phosphReadings = [];
        if (Array.isArray(phosphorus)) { //Check if many phosphorus were submitted
            for (let i = 0; i < phosphorus.length; i++) { //Iterate over each phosphorus
                const currPhosphorus = new Phosphorus();

                currPhosphorus.report_fk = newReport._id; //Assign parent report foreign key
                currPhosphorus.creator = req.user._id; //Assign user ID
                currPhosphorus.phosphorus = phosphorus[i]; //Assign rest of attributes to the phosphorus report
                currPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] };

                await currPhosphorus.save(); //Save report to database
                phosphReadings.push(currPhosphorus);
            }
        } else { //Single phosphorus reading was submitted
            const currPhosphorus = new Phosphorus();

            currPhosphorus.report_fk = newReport._id; //Assign parent report foreign key
            currPhosphorus.creator = req.user._id; //Assign user ID
            currPhosphorus.phosphorus = phosphorus; //Assign rest of attributes to the phosphorus report
            currPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] };

            await currPhosphorus.save(); //Save report to database
            phosphReadings.push(currPhosphorus);
        }
        // add phosph readings to the current lake health report
        newReport.phosphorus = phosphReadings;
    }


    if (calcium) { //Check user submitted the field, if yes execute, otherwise move to next attribute
        const {calciumCoordinateX, calciumCoordinateY} = req.body; //Get rest of associated calcium attributes
        let calciumReadings = [];

        if (Array.isArray(calcium)) { //Check if many calcium were submitted
            for (let i = 0; i < calcium.length; i++) { //Iterate over each calcium
                const currCalcium = new Calcium();

                currCalcium.report_fk = newReport._id; //Assign parent report foreign key
                currCalcium.creator = req.user._id; //Assign user ID
                currCalcium.calcium = calcium[i]; //Assign rest of attributes to the phosphorus report
                currCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] };

                await currCalcium.save(); //Save report to database
                // At this point it will have been succesfully saved, so push to final readings
                calciumReadings.push(currCalcium)
            }
        } else { //Single calcium report is submitted
            const currCalcium = new Calcium();

            currCalcium.report_fk = newReport._id; //Assign parent report foreign key
            currCalcium.creator = req.user._id; //Assign user ID
            currCalcium.calcium = parseInt(calcium); //Assign rest of attributes to the phosphorus report
            currCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] };

            await currCalcium.save(); //Save report to database
            calciumReadings.push(currCalcium);
        }
        // add all calcium readings to current report
        newReport.calcium = calciumReadings;
    }

    await newReport.save(); //Save the report to the database

    // save success trigger
    req.flash('success', 'Successfully Created Report');
    // redirect back to view single lakeReports page
    res.redirect(`/lakeReports/${newReport._id}`); // redirect to avoid form resubmission on refresh
};

//Render single lake report page
module.exports.showLakeReport = async (req, res) => {
    if (req.user.rank < 2) { //Check if user is above rank 1 (researcher(2) or administrator(3))
        req.flash('error', "Your account doesn't have permission."); //If not, redirect to home page and display rejection message
        return res.redirect('/');
    }
    // pull id from url
    const { id } = req.params;
    // look up the health report corresponding to the id passed in to the url
    const foundReport = await LakeHealthReport.findById(id).populate('creator'); // passing in creator field, allows you to access associated "creator" object properties with .populate
    const foundDoTemp = await DO_Temp.find({report_fk : foundReport._id},{}) //Get all associated DO_Temp reports
    const foundSecchi = await Secchi.find({report_fk : foundReport._id},{}) //Get all associated Secchi reports
    const foundPhosphorus = await Phosphorus.find({report_fk : foundReport._id},{}) //Get all associated Phosphorus reports
    const foundCalcium = await Calcium.find({report_fk : foundReport._id},{}) //Get all associated Calcium reports

    // send them to the page about the single report, page will render all the data
    res.render('lakeReports/details', { foundReport, foundDoTemp, foundSecchi, foundPhosphorus, foundCalcium });
};

//Render the edit report page
module.exports.renderEditForm = async (req, res) => {
    if (req.user.rank < 2) { //Check if user is above rank 1 (researcher(2) or administrator(3))
        req.flash('error', "Your account doesn't have permission."); //If not, redirect to home page and display rejection message
        return res.redirect('/');
    }
    const { id } = req.params; // pull id from url
    const lakeReport = await LakeHealthReport.findById(id); // look up the health report corresponding to the id passed in to the url
    const foundDoTemp = await DO_Temp.find({report_fk : lakeReport._id},{}) //Get all associated DO_Temp reports
    const foundSecchi = await Secchi.find({report_fk : lakeReport._id},{}) //Get all associated Secchi reports
    const foundPhosphorus = await Phosphorus.find({report_fk : lakeReport._id},{}) //Get all associated Phosphorus reports
    const foundCalcium = await Calcium.find({report_fk : lakeReport._id},{}) //Get all associated Calcium reports

    if(!lakeReport) { //If the desired report doesnt exist, redirect to the home page
        req.flash('error', "Could not find that lake report.");
        return res.redirect('/lakeReports');
    }
    res.render("lakeReports/edit", { lakeReport, foundDoTemp, foundSecchi, foundPhosphorus, foundCalcium }); //Otherwise render edit page
};

//Update a lake health report upon edit report submission
module.exports.updateLakeReport = async (req, res) => {
    if (req.user.rank < 2) { //Check if user is above rank 1 (researcher(2) or administrator(3))
        req.flash('error', "Your account doesn't have permission."); //If not, redirect to home page and display rejection message
        return res.redirect('/');
    }

    const { id } = req.params; // find lake report with given id

    const { date_generated, notes, perc_shore_devd } = req.body; //Get all other fields associated with the LakeHealthReport object
    const lakeReport = await LakeHealthReport.findByIdAndUpdate(id, { date_generated: date_generated, notes: notes, perc_shore_devd: perc_shore_devd}); //Update the object itself

    //Now proceed to update each of its child fields
    const {doTemp_id, secchi_id, phosphorus_id, calcium_id} = req.body;

    if (doTemp_id) { //Check if doTemps were submitted
        const {temperature, dissolved_oxygen, doTempCoordinateX, doTempCoordinateY, doTempDepth} = req.body; //If they were, get the rest of the associated fields

        if (Array.isArray(doTemp_id)) { //If many were submitted, items will be in an array
            for (let i = 0; i < doTemp_id.length; i++) { //Iterate over each doTemp submitted
                if (doTemp_id[i] === "?") { //If no ID is provided, create a new entry
                    const newDoTemp = new DO_Temp();

                    newDoTemp.report_fk = lakeReport._id; //Assign parent report foreign key
                    newDoTemp.creator = req.user._id; //Assign user ID
                    newDoTemp.dissolvedOxygen = dissolved_oxygen[i]; //Assign rest of attributes to the DoTemp report
                    newDoTemp.temperature = temperature[i];
                    newDoTemp.depth = doTempDepth[i];
                    newDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] };

                    await newDoTemp.save(); //Save the new report
                } else { //Otherwise, update existing report using associated ID
                    const doTempReport = await DO_Temp.findByIdAndUpdate(doTemp_id[i], { dissolvedOxygen: dissolved_oxygen[i], temperature: temperature[i], depth: doTempDepth[i], location: { type: 'Point', coordinates: [doTempCoordinateX[i], doTempCoordinateY[i]] }});
                }
            }
        } else { //If single report is submitted, fields will not be submitted as array, process individually
            if (doTemp_id === "?") { //If no ID is provided (id='?'), create a new entry
                const newDoTemp = new DO_Temp();

                newDoTemp.report_fk = lakeReport._id; //Assign parent report foreign key
                newDoTemp.creator = req.user._id; //Assign user ID
                newDoTemp.dissolvedOxygen = dissolved_oxygen; //Assign rest of attributes to the DoTemp report
                newDoTemp.temperature = temperature;
                newDoTemp.depth = doTempDepth;
                newDoTemp.location = { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] };

                await newDoTemp.save(); //Save the new report
            } else { //Otherwise, update existing report using associated ID
                const doTempReport = await DO_Temp.findByIdAndUpdate(doTemp_id, { dissolvedOxygen: dissolved_oxygen, temperature: temperature, depth: doTempDepth, location: { type: 'Point', coordinates: [doTempCoordinateX, doTempCoordinateY] }});
            }
        }
    }

    if (secchi_id) { //Check if secchi were submitted
        const {secchi_depth, secchiCoordinateX, secchiCoordinateY, secchiDepth} = req.body; //If they were, get the rest of the associated fields

        if (Array.isArray(secchi_id)) { //If many were submitted, items will be in an array
            for (let i = 0; i < secchi_id.length; i++) { //Iterate over each secchi reading
                if (secchi_id[i] === "?") { //If no ID is provided, create a new entry
                    const newSecchi = new Secchi();

                    newSecchi.report_fk = lakeReport._id; //Assign parent report foreign key
                    newSecchi.creator = req.user._id; //Assign user ID
                    newSecchi.secchi = secchi_depth[i]; //Assign rest of attributes to the secchi report
                    newSecchi.depth = secchiDepth[i];
                    newSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] };

                    await newSecchi.save(); //Save new report
                } else { //Otherwise, update existing report using associated ID
                    const secchiReport = await Secchi.findByIdAndUpdate(secchi_id[i], { secchi: secchi_depth[i], depth: secchiDepth[i], location: { type: 'Point', coordinates: [secchiCoordinateX[i], secchiCoordinateY[i]] }});
                }
            }
        } else { //If not array, perform singular operation
            if (secchi_id === "?") { //If no ID is provided, create a new entry
                const newSecchi = new Secchi();

                newSecchi.report_fk = lakeReport._id; //Assign parent report foreign key
                newSecchi.creator = req.user._id; //Assign user ID
                newSecchi.secchi = secchi_depth; //Assign rest of attributes to the secchi report
                newSecchi.depth = secchiDepth;
                newSecchi.location = { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] };

                await newSecchi.save(); //Save new report
            } else { //Otherwise, update existing report using associated ID
                const secchiReport = await Secchi.findByIdAndUpdate(secchi_id, { secchi: secchi_depth, depth: secchiDepth, location: { type: 'Point', coordinates: [secchiCoordinateX, secchiCoordinateY] }});
            }
        }
    }

    if (phosphorus_id) { //Check if phosphorus were submitted
        const {phosphorus, phosphorusCoordinateX, phosphorusCoordinateY} = req.body; //If they were, get the rest of the associated fields

        if (Array.isArray(phosphorus_id)) { //If array, parse every item
            for (let i = 0; i < phosphorus_id.length; i++) {
                if (phosphorus_id[i] === "?") { //If no ID is provided, create a new entry
                    const newPhosphorus = new Phosphorus();

                    newPhosphorus.report_fk = lakeReport._id; //Assign parent report foreign key
                    newPhosphorus.creator = req.user._id; //Assign user ID
                    newPhosphorus.phosphorus = phosphorus[i]; //Assign rest of attributes to the phosphorus report
                    newPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] };

                    await newPhosphorus.save(); //Save new report
                } else { //Otherwise, update existing report using associated ID
                    const phosphorusReport = await Phosphorus.findByIdAndUpdate(phosphorus_id[i], { phosphorus: phosphorus[i], location: { type: 'Point', coordinates: [phosphorusCoordinateX[i], phosphorusCoordinateY[i]] }});
                }
            }
        } else { //If not array, perform singular operation
            if (phosphorus_id === "?") { //If no ID is provided, create a new entry
                const newPhosphorus = new Phosphorus();

                newPhosphorus.report_fk = lakeReport._id; //Assign parent report foreign key
                newPhosphorus.creator = req.user._id; //Assign user ID
                newPhosphorus.phosphorus = phosphorus; //Assign rest of attributes to the phosphorus report
                newPhosphorus.location = { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] };

                await newPhosphorus.save(); //Save new report
            } else { //Otherwise, update existing report using associated ID
                const phosphorusReport = await Phosphorus.findByIdAndUpdate(phosphorus_id, { phosphorus: phosphorus, location: { type: 'Point', coordinates: [phosphorusCoordinateX, phosphorusCoordinateY] }});
            }
        }
    }

    if (calcium_id) { //Check if calcium were submitted
        const {calcium, calciumCoordinateX, calciumCoordinateY} = req.body; //If they were, get the rest of the associated fields

        if (Array.isArray(calcium_id)) { //If array, parse every item
            for (let i = 0; i < calcium_id.length; i++) {
                if (calcium_id[i] === "?") { //If no ID is provided, create a new entry
                    const newCalcium = new Calcium();

                    newCalcium.report_fk = lakeReport._id; //Assign parent report foreign key
                    newCalcium.creator = req.user._id; //Assign user ID
                    newCalcium.calcium = calcium[i]; //Assign rest of attributes to the calcium report
                    newCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] };

                    await newCalcium.save(); //Save new report
                } else { //Otherwise, update existing report using associated ID
                    const calciumReport = await Calcium.findByIdAndUpdate(calcium_id[i], { calcium: calcium[i], location: { type: 'Point', coordinates: [calciumCoordinateX[i], calciumCoordinateY[i]] }});
                }
            }
        } else { //If not array, perform singular operation
            if (calcium_id === "?") { //If no ID is provided, create a new entry
                const newCalcium = new Calcium();

                newCalcium.report_fk = lakeReport._id; //Assign parent report foreign key
                newCalcium.creator = req.user._id; //Assign user ID
                newCalcium.calcium = calcium; //Assign rest of attributes to the calcium report
                newCalcium.location = { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] };

                await newCalcium.save(); //Save new report
            } else { //Otherwise, update existing report using associated ID
                const calciumReport = await Calcium.findByIdAndUpdate(calcium_id, { calcium: calcium, location: { type: 'Point', coordinates: [calciumCoordinateX, calciumCoordinateY] }});
            }
        }
    }

    req.flash('success', "Successfully updated Lake Report");
    res.redirect(`/lakeReports/${lakeReport._id}`);
};

// DELETE ROUTE - Lake Report
module.exports.deleteLakeReport = async (req, res) => {
    if (req.user.rank < 2) { //User must be rank 2 (researcher) or higher (administrator)
        req.flash('error', "Your account doesn't have permission."); //If user doesn't have correct rank, reject and redirect to home page
        return res.redirect('/');
    }
    const { id } = req.params; //Get report ID from URL
    res.send(id);
    // await LakeHealthReport.findByIdAndDelete(id); //Delete from database
    // req.flash('success', "Successfully deleted Lake Report"); //Redirect user
    // res.redirect('/lakeReports');
};
