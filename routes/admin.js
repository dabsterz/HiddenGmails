const express = require('express');
const passport = require('passport');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const csv = require('fast-csv');
const upload = multer({ dest: '../tmp/csv/' });
const Main = require('../models/main');

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
        if (req.user.discordid == '748143796814086265' || req.user.discordid == '936329238993326090' || req.user.discordid == '475109099705729024') {
            next()
        } else {
            res.status(403).send("NEGAY")
        }
    } else {
        res.status(403).send("GAY")
    }
}

router.get('/loopsolutionsgoat', isAdminmiddleware, (req,res) => {
    Main.findAndCountAll({raw:true}).then((gmails) => {
        res.render("admin", {layout: "main", user: req.user, admin: true, stock: gmails.count})
    })
})

router.post('/gmailupload', isAdminmiddleware, upload.single('filename'), (req,res) => {
    const fileRows = [];

  // open uploaded file
  csv.parseFile(req.file.path)
    .on("data", function (data) {
      fileRows.push(data); // push each row
    })
    .on("end", async function () {
      fs.unlinkSync(req.file.path);   // remove temp file
      headers = fileRows.shift()
      try {
        for (x in fileRows) {
            console.log(fileRows[x])
            await Main.create({
                email: fileRows[x][0],
                password: fileRows[x][1],
                recovery: fileRows[x][2],
                proxy: fileRows[x][3],
                proxyexpiry: fileRows[x][4]
            })
          }
          res.status(200).send("Success")
      } catch(e) {
        res.status(500).send(e)
      }
    })
})

module.exports = router;