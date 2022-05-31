const express = require('express');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser'); //to retrieve req.body
const Sequelize = require('sequelize');
// const Stripe = require('stripe')
// const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY)
const stripe = require('stripe')("sk_test_51IV9PXGpiEp0kvwc9RVQuYfUaDUyMm5f3N3wweSAXi6gqZmdYRkTeVnByI3yxwLIBUQOgrS5reDoC8naFtY7uuFK00OTE594LZ");


const webhookSecret = "whsec_fdad0fbd6a224d0010b0645e3f572ff6aaa2a624d67bff4b5036fa1f6c1dce58";

const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

var app = express()
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static('public'))

//MiddleWares
// Body parser middleware to parse HTTP body in order to read HTTP data
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
});

// Stripe requires the raw body to construct the event
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    console.log(req.body)
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        // On error, log and return the error message
        console.log(`❌ Error message: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Successfully constructed event
    console.log('✅ Success:', event.id);

    // Return a response to acknowledge receipt of the event
    res.json({received: true});
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//Routes
const mainRoute = require('./routes/main')

//Routes 2.0
app.use("/", mainRoute)

// HandleBar middlewares
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'test',
    helpers: {
        loopcourse: function(value, options) {
            return options.fn({ test: value })
        },
        ifEquals(a, b, options) {
            // console.log("helper function")
            // console.log(a)
            // console.log(b)
            if (a == b) {
                // console.log("Printing ifEquals helper")
                // console.log(this)
                return options.fn(this)
            } else {
                return options.inverse(this) //hide this
            }
        },
        ifSame(a, b) {
            return a == b
        },
        format(date) {
            date = new Date(Date.parse(date));
            console.log(Date.parse(date.getFullYear(), date.getMonth(), date.getDate()));
            dateParsed = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
            // return `${dateParsed.getFullYear()} - ${(dateParsed.getMonth() + 1)} - ${dateParsed.getDate()}`
            return dateParsed
        },
        ifNotEquals(a, b) {
            return a != b;
        },
        forloop(from, to, incr, block) {
            var accum = ''
            for (var i = from; i < to; i += incr) {
                block.data.index = i;
                accum += block.fn(i);
            }
            return accum;
        },
        ifInBetween(a, b, c) {
            return a >= b && a <= c;
        },
        ifGreater(a, b) {
            return a > b;
        },
        lengthMoreThan(a, b, options) {
            // console.log("this is a", a)
            // console.log("this is b", b)
            if (a) {
                if (a.length >= b) {
                    return options.fn(this)
                }
                return options.inverse(this)
            }
            return options.inverse(this)
        },
        printToConsole(a) {
            console.log("this is print to console", a)
        },
        takeLast3(notification) {
            var slicednoti = notification.slice(notification.length - 3, notification.length).reverse()
            console.log("slicednoti", slicednoti)
            toreturn = ''
            for (i in slicednoti) {
                toreturn += `<div class="notifi__item notifiitem${parseInt(i) + 1}"><div class="bg-c1 img-cir img-40"><i class="zmdi zmdi-email-open"></i></div><div class="content"><p>You got a email notification</p><span class="date">${slicednoti[i].notificationmsg.DateSent}</span></div></div>`
            }
            return toreturn
        },
        // return notification.slice(notification.length - 3, notification.length).reverse()
        timestampFormat(date) {
            var date = new Date(Date.parse(date));
            console.log('Date', date);

            var year = date.getFullYear();
            console.log('YEARS', year);
            var month = date.getMonth();
            console.log('month', month);
            var day = date.getDate();
            console.log('day', day);

            var hours = date.getHours();
            console.log('HOURS', hours);
            var minutes = date.getMinutes();
            console.log('MINUTES', minutes);
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = day + "/" + month + "/" + year + " " + hours + ':' + minutes + ' ' + ampm;
            console.log('Date', strTime);
            return strTime
        },
        ifAllSame(a, b, c, d, e, f) {
            if (a == b && b == c && c == d && d == e && e == f) {
                return true
            } else {
                return false
            }
        },
        ifElementInList(a, b, c) {
            console.log(a);
            console.log(b);
            var boolans;
            for (const [key, value] of Object.entries(b)) {
                console.log("This is the key: ", key);
                console.log("This is the value: ", value);
                console.log(value[c]);
                if (value[c] == a) {
                    boolans = true;
                    break
                } else {
                    boolans = false
                }
            }
            return boolans
        }


    },
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');



app.set('port', (process.env.PORT || 3000));

io.on('connection', function(client) {
    console.log('Client connected...');
    client.on('join', function(data) {
        console.log(data);
        client.on('messages', function(data) {
            client.emit('createnotification', data);
            client.broadcast.emit('createnotification', data);
        });
    });
});



//Initializing app with this port number
http.listen(app.get('port'), function() {
    console.log(`Server started on port ${app.get('port')}`)
});