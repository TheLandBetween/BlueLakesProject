const express = require('express');
const router = express.Router();
const path = require('path'); // duplicated in index.js, need to replace with partial that includes
const catchAsync = require('../utils/catchAsync');

const UserAccount = require(path.join(__dirname, "../views/models/User_Account"));

// index route
// GET /lakeReports - list all lakeReports
router.get('/',  catchAsync(async (req, res) => {
    // async callback to wait for health lakeReports to be received, then respond with webpage
    // render index.ejs file with the lakeReports 'database'
    res.send('test');
}));

router.get('/fakeUser', catchAsync(async (req, res) => {
    const user = new UserAccount({firstName: 'billy', lastName: 'bob', username: 'test@gmail.com'});
    const newUser = await UserAccount.register(user, 'tempPassword'); // register a new instance of a user model, with a password (hashes on its own)
    res.send(newUser);
}));

router.get('/register', catchAsync(async (req, res) => {
    res.render('userAccounts/register', {levelDeep: levelDeep = true});
}));

// /register - FORM
// POST /register - create user

router.post('/login', catchAsync(async (req, res) => {
    res.render('/', {levelDeep: levelDeep = true});
}));



module.exports = router;
