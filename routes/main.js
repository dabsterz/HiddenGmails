const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const Stripe = require('stripe')
const stripe = Stripe('sk_test_51IV9PXGpiEp0kvwc9RVQuYfUaDUyMm5f3N3wweSAXi6gqZmdYRkTeVnByI3yxwLIBUQOgrS5reDoC8naFtY7uuFK00OTE594LZ')
const bodyParser = require('body-parser');
const endpointSecret = "whsec_fdad0fbd6a224d0010b0645e3f572ff6aaa2a624d67bff4b5036fa1f6c1dce58";

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

// router.post('/webhook', bodyParser.raw({type: 'application/json'}), (req, res)=>{
//     const payload = JSON.stringify(req.body, null, 2);
//     const sig = req.headers['stripe-signature'];
//     console.log(payload)
//     console.log(sig)
  
//     let event = {};
    
//     try {
//       event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
//     } catch (err) {
//       console.log(`Webhook Error: ${err}`)
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
  
//     response.status(200);
//       // const authevent = req.body
//       // const sig = req.headers['stripe-signature']
//       // let event
//       // try {
//       //     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
//       // } catch (err) {
//       //     console.log(err)
//       //     return res.status(400).send(`Webhook Error: ${err.message}`)
//       // }
//       switch (event.type) {
//           case 'checkout.session.completed': {
//             console.log("NEFACXE")
//             const sessionid = stripe.checkout.sessions.retrieve(event['data']['object']['id'],{expand:['line_items']});
//             const session_id = sessionid.line_items
//             console.log(session_id)
//             const session = event.data.object;
//             createOrder(session);
//             if (session.payment_status === 'paid') {
//               fulfillOrder(session);
//             }
      
//             break;
//           }
      
//           case 'checkout.session.async_payment_succeeded': {
//             const session = event.data.object;
      
//             // Fulfill the purchase...
//             fulfillOrder(session);
      
//             break;
//           }
      
//           case 'checkout.session.async_payment_failed': {
//             const session = event.data.object;
      
//             // Send an email to the customer asking them to retry their order
//             emailCustomerAboutFailedPayment(session);
      
//             break;
//           }
//         }
//       console.log(event)
//   })

module.exports = router;