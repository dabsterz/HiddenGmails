const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const Stripe = require('stripe')
const stripe = Stripe('sk_test_51IV9PXGpiEp0kvwc9RVQuYfUaDUyMm5f3N3wweSAXi6gqZmdYRkTeVnByI3yxwLIBUQOgrS5reDoC8naFtY7uuFK00OTE594LZ')
const bodyParser = require('body-parser');
const endpointSecret = "whsec_fdad0fbd6a224d0010b0645e3f572ff6aaa2a624d67bff4b5036fa1f6c1dce58";
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { MessageEmbed, WebhookClient } = require('discord.js');
const nodemailer = require('nodemailer')

/* models */
const Main = require('../models/main');
const Orders = require('../models/orders')
const Awaiting_payment = require('../models/temp')
const transporter = require('../models/gmail')
const { cookie } = require('express-validator');
const uuid = require('uuid')
const auth = require('./auth')

//express validator
const { body, validationResult } = require('express-validator');
const { route } = require('express/lib/application');
const { unregisterDecorator } = require('handlebars');
const { text } = require('express');
const SoldGmails = require('../models/soldgmails');
const passport= require('passport');

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
        if (req.user.discordid == '748143796814086265' || req.user.discordid == '936329238993326090' || req.user.discordid == '475109099705729024') {
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
    if (req.user.discordid == '748143796814086265') {
        next()
    } else {
        res.status(403)
    }
}

var createOrder = async (session, lineitem) => {
    console.log(session.metadata)
    console.log(session.customer_details.email)
    console.log(lineitem.data[0].quantity)
    console.log(session.payment_intent)
    try {
        ordernumber = await Orders.create({
            customer: session.customer_details.email,
            discord: session.metadata.username,
            quantity: lineitem.data[0].quantity,
            paymentintent: session.payment_intent
        });
        console.log(ordernumber)
        allocatedgmails = await Main.findAll({
            limit: lineitem.data[0].quantity,
        })
        if (allocatedgmails.length != lineitem.data[0].quantity) {
            throw 'Not enough gmails in database'
        }
        for (let i in allocatedgmails) {
            console.log(allocatedgmails[i])
            await Awaiting_payment.create({
                maintableid: allocatedgmails[i].dataValues.id,
                email: allocatedgmails[i].dataValues.email,
                password: allocatedgmails[i].dataValues.password,
                recovery: allocatedgmails[i].dataValues.recovery,
                proxy: allocatedgmails[i].dataValues.proxy,
                proxyexpiry: allocatedgmails[i].dataValues.proxyexpiry,
                dateadded: allocatedgmails[i].dataValues.dateadded,
                orderno: ordernumber.dataValues.idorders,
            });
            // await Main.destroy({where: {id:allocatedgmails[i].dataValues.id}})
        }
        orderwebhook = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/981590601894088704/NYXsv1ebehvn38VWG4l9CgLZGspfoC8bK0UbqifmxGOhehrIlKppijvob7R7TTRZilB7' });
        const newEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('An order has been created')
            .addFields(
                { name: 'OrderNumber', value: ordernumber.dataValues.idorders.toString(), inline: true },
                { name: 'Customer', value:  session.customer_details.email, inline: true},
                { name: 'Discord', value: session.metadata.username, inline: true},
                { name: 'Type', value: '0.9/OC Gmails With Proxy', inline: true},
                { name: 'Quantity', value: lineitem.data[0].quantity.toString(), inline: true },
                { name: 'Time', value: Date(Date.now())},
            )
        orderwebhook.send({
            username: 'LoopBot',
            avatarURL: 'https://s9.rr.itc.cn/r/wapChange/201612_7_19/a1qff8488690432670.jpg',
            embeds: [newEmbed]
        })
    } catch(err) {
        console.log(err)
        orderwebhook = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/981590601894088704/NYXsv1ebehvn38VWG4l9CgLZGspfoC8bK0UbqifmxGOhehrIlKppijvob7R7TTRZilB7' });
        const newEmbed = new MessageEmbed()
            .setColor('#ff3333')
            .setTitle('There was an error creating an order')
            .addFields(
                { name: 'Error', value: err.message},
                { name: 'OrderNumber', value: ordernumber.dataValues.idorders.toString(), inline: true },
                { name: 'Customer', value:  session.customer_details.email, inline: true},
                { name: 'Quantity', value: lineitem.data[0].quantity.toString(), inline: true },
                { name: 'Type', value: '0.9/OC Gmails With Proxy'},
                { name: 'Time', value: Date(Date.now())},
            )
        orderwebhook.send({
            username: 'LoopBot',
            avatarURL: 'https://s9.rr.itc.cn/r/wapChange/201612_7_19/a1qff8488690432670.jpg',
            content: '<@748143796814086265><@936329238993326090>',
            embeds: [newEmbed]
        })
    }
}

var fulfillOrder = async (session) => {
    try{
        ordernumber = await Orders.findAll({where:{paymentintent: session.payment_intent},attributes:['idorders','customer','discord','quantity']})
        console.log(ordernumber[0].dataValues.idorders)
        boughtgmails = await Awaiting_payment.findAll({where:{orderno: ordernumber[0].dataValues.idorders}})
        gmailstring = ""
        for (i in boughtgmails) {
            row = boughtgmails[i].dataValues
            await SoldGmails.create({
                email: row.email,
                password: row.password,
                recovery: row.recovery,
                proxy: row.proxy,
                proxyexpiry: row.proxyexpiry,
                dateadded: row.dateadded,
                customer: ordernumber[0].dataValues.customer,
                discord: ordernumber[0].dataValues.discord,
                orderno: ordernumber[0].dataValues.idorders
            })
            await Awaiting_payment.destroy({where:{awaitingid:row.awaitingid}})
            gmailstring += row.email + ":::" + row.password + ":::" + row.recovery + ":::" + row.proxy + "\n" 
        }
        await transporter.sendMail({
            from: 'Loop Solutions <orders@manualloop.com>',
            to: ordernumber[0].dataValues.customer,
            subject: `Order #${ordernumber[0].dataValues.idorders}`,
            text: gmailstring
        })
        orderwebhook = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/981982436055478372/2dRJWx9Fr5nmw6gLq6a3KKOKMZztMEW5ZT2ny5LtmDTt2xhQI5iU5NRy0UvZGjQ_8kuD' });
        const newEmbed = new MessageEmbed()
            .setColor('#80007F')
            .setTitle('An order has been fulfilled')
            .addFields(
                { name: 'OrderNumber', value: ordernumber[0].dataValues.idorders.toString(), inline: true },
                { name: 'Customer', value:  session.customer_details.email, inline: true},
                { name: 'Discord', value:  ordernumber[0].dataValues.discord, inline: true},
                { name: 'Type', value: '0.9/OC Gmails With Proxy', inline: true},
                { name: 'Quantity', value: ordernumber[0].dataValues.quantity.toString(), inline: true },
                { name: 'Time', value: Date(Date.now())},
            )
        orderwebhook.send({
            username: 'LoopBot',
            avatarURL: 'https://s9.rr.itc.cn/r/wapChange/201612_7_19/a1qff8488690432670.jpg',
            embeds: [newEmbed]
        })
    } catch(err) {
        orderwebhook = new WebhookClient({ url: 'https://ptb.discord.com/api/webhooks/981982436055478372/2dRJWx9Fr5nmw6gLq6a3KKOKMZztMEW5ZT2ny5LtmDTt2xhQI5iU5NRy0UvZGjQ_8kuD' });
        const newEmbed = new MessageEmbed()
            .setColor('#ff3333')
            .setTitle('There was an error fulfilling an order')
            .addFields(
                { name: 'Error', value: err.message},
                { name: 'OrderNumber', value: ordernumber[0].dataValues.idorders.toString(), inline: true },
                { name: 'Customer', value:  session.customer_details.email, inline: true},
                { name: 'Discord', value:  ordernumber[0].dataValues.discord, inline: true},
                { name: 'Type', value: '0.9/OC Gmails With Proxy', inline: true},
                { name: 'Quantity', value: ordernumber[0].dataValues.quantity.toString(), inline: true },
                { name: 'Time', value: Date(Date.now())},
            )
        orderwebhook.send({
            username: 'LoopBot',
            avatarURL: 'https://s9.rr.itc.cn/r/wapChange/201612_7_19/a1qff8488690432670.jpg',
            content: '<@748143796814086265><@936329238993326090>',
            embeds: [newEmbed]
        })
    }
}

router.get('/',  (req,res) => {
    console.log(req.user)
    console.log("Requested for index")
    Main.findAndCountAll({raw:true}).then((gmails) => {
        console.log(gmails.count)
        if (gmails.count > 0) {
            res.render("home",{layout:"main", stock: gmails.count, user: req.user, admin: isAdmin(req)})
        } else {
            res.render("home",{layout:"main", stock: false, user: req.user, admin: isAdmin(req)})
        }
    }).catch(err=> console.log(err))
})

router.post('/payment', isLoggedin, (req,res) => {
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
                    metadata: req.user, 
                    payment_method_types: ['card'],
                    mode: 'payment',
                    success_url:"http://localhost:3000/",
                    cancel_url: "http://localhost:3000/"
                }, {
                    idempotencyKey: uuid.v4()
                })
                console.log(session.url)
                res.redirect(session.url)
            } catch (err) {
                console.log(err)
                res.status(500).send(err)
            }
        }
        
    })
})

// Stripe requires the raw body to construct the event
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    console.log(req.body)
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        // On error, log and return the error message
        console.log(`❌ Error message: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Successfully constructed event
    console.log('✅ Success:', event.id);

    // Return a response to acknowledge receipt of the event
    switch (event.type) {
        case 'checkout.session.completed': {
          const sessionid = stripe.checkout.sessions.retrieve(event['data']['object']['id'],{expand:['line_items']});
          sessionid.then(async function(result){
            const session_id = result.line_items
            const session = event.data.object;
            console.log(session)
            await createOrder(session, session_id);
            if (session.payment_status === 'paid') {
                console.log("paid")
                await fulfillOrder(session);
            }
          })
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
});

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
      // const authevent = req.body
      // const sig = req.headers['stripe-signature']
      // let event
      // try {
      //     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
      // } catch (err) {
      //     console.log(err)
      //     return res.status(400).send(`Webhook Error: ${err.message}`)
      // }
      
//       console.log(event)
//   })

module.exports = router;