const express = require('express');
const passport = require('passport');
const router = express.Router();

var isLoggedin = async (req,res,next) => {
    console.log(req.user)
    if (req.user) {
        next()
    } else {
        res.redirect("/auth")
    }
}

var isAdmin = (req) => {
    if (req.user) {
        if (req.user.discordid == '748143796814086265') {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
    
}

var isAdminmiddleware = async (req,res,next) => {
    console.log(req.user)
    if (req.user) {
        if (req.user.discordid == '748143796814086265') {
            next()
        } else {
            res.status(403).send("NEGAY")
        }
    } else {
        res.status(403).send("GAY")
    }
}

router.get('/loopsolutionsgoat', isAdminmiddleware, (req,res) => {
    res.render("admin", {layout: "main", user: req.user, admin: true})
})

router.post('/gmailupload', isAdminmiddleware, (req,res) => {
    res.status(200).send("NE")
})

module.exports = router;