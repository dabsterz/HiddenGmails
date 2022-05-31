const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const stripe = require('stripe')('sk_test_51IV9PXGpiEp0kvwc9RVQuYfUaDUyMm5f3N3wweSAXi6gqZmdYRkTeVnByI3yxwLIBUQOgrS5reDoC8naFtY7uuFK00OTE594LZ')
/* models */
const Main = require('../models/main');
const { cookie } = require('express-validator');

const bodyParser = require('body-parser');


const createOrder = (session) => {}

router.post('/webhook', express.raw({type: 'application/json'}), (req, res)=>{
  const payload = req.body;
  const sig = req.headers['stripe-signature'];
  console.log(payload)
  console.log(sig)

  let event;
  const endpointSecret = "whsec_fdad0fbd6a224d0010b0645e3f572ff6aaa2a624d67bff4b5036fa1f6c1dce58";
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err}`)
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  response.status(200);
    // const authevent = req.body
    // const sig = req.headers['stripe-signature']
    // let event
    // try {
    //     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    // } catch (err) {
    //     console.log(err)
    //     return res.status(400).send(`Webhook Error: ${err.message}`)
    // }
    switch (event.type) {
        case 'checkout.session.completed': {
          console.log("NEFACXE")
          const sessionid = stripe.checkout.sessions.retrieve(event['data']['object']['id'],{expand:['line_items']});
          const session_id = sessionid.line_items
          console.log(session_id)
          const session = event.data.object;
          createOrder(session);
          if (session.payment_status === 'paid') {
            fulfillOrder(session);
          }
    
          break;
        }
    
        case 'checkout.session.async_payment_succeeded': {
          const session = event.data.object;
    
          // Fulfill the purchase...
          fulfillOrder(session);
    
          break;
        }
    
        case 'checkout.session.async_payment_failed': {
          const session = event.data.object;
    
          // Send an email to the customer asking them to retry their order
          emailCustomerAboutFailedPayment(session);
    
          break;
        }
      }
    console.log(event)
})

module.exports = router;