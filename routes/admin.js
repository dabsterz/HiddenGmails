const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/loopsolutionsgoat', passport.authenticate('discord'))
router.get('/loopsolutionsgoat/redirect', passport.authenticate('discord',{
    failureRedirect: '/'
}), (req,res) => {
    console.log("hel")
    res.redirect("/secret")
})

module.exports = router;