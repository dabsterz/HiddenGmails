const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const Stripe = require('stripe')
const stripe = Stripe('sk_test_51IV9PXGpiEp0kvwc9RVQuYfUaDUyMm5f3N3wweSAXi6gqZmdYRkTeVnByI3yxwLIBUQOgrS5reDoC8naFtY7uuFK00OTE594LZ')
/* models */
const Main = require('../models/main');
const { cookie } = require('express-validator');
const uuid = require('uuid')

//express validator
const { body, validationResult } = require('express-validator');
const { route } = require('express/lib/application');
const { unregisterDecorator } = require('handlebars');

router.get('/', (req,res) => {
    console.log("Requested for index")
    Main.findAndCountAll({raw:true}).then((gmails) => {
        console.log(gmails.count)
        if (gmails.count > 0) {
            res.render("home",{layout:"main", stock: gmails.count})
        } else {
            res.render("home",{layout:"main", stock: false})
        }
    }).catch(err=> console.log(err))
})

router.post('/payment', (req,res) => {
    console.log("Requested to pay")
    if (isNaN(req.body.quantity)) {
        return res.status(500).send("Error in Quantity")
    }
    Main.findAndCountAll({raw:true}).then(async (gmails) => {
        if (gmails.count < req.body.quantity) {
            return res.status(501).send("OOS")
        } else {
            try {
                const session = await stripe.checkout.sessions.create({
                    line_items: [{
                        name:'0.9/OC Gmails',
                        amount: 1500,
                        currency: 'usd',
                        quantity:req.body.quantity,
                        }], 
                    payment_method_types: ['card'],
                    mode: 'payment',
                    success_url:"http://localhost:3000/",
                    cancel_url: "http://localhost:3000/"
                }, {
                    idempotencyKey: uuid.v4()
                })
                console.log(session.url)
                console.log('hello')
                res.redirect(session.url)
            } catch (err) {
                console.log(err)
                res.status(500).send(err)
            }
        }
        
    })
})

module.exports = router;