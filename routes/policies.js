// import necessary features & middleware for routes
const express = require('express');
const router = express.Router();

router.get('/privacy/reptailers', function(req, res) {
    res.render('policies/reptailers-privacy-policy');
} )

module.exports = router;