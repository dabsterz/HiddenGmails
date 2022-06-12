const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', passport.authenticate('discord', {
    successReturnToOrRedirect: '/payment',
    failureRedirect: '/'
}));

router.get('/redirect', passport.authenticate('discord', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/'
}), (req,res) => {
    res.send(200);
})

module.exports = router;