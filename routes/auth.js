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

router.get('/logout', function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
  });

module.exports = router;