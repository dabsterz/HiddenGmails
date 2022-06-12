const express = require('express');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser'); //to retrieve req.body
const Sequelize = require('sequelize');
const passport = require('passport')
const DiscordStrategy = require('./config/discordstrategy')
const stripe = require('stripe')("sk_test_51IV9PXGpiEp0kvwc9RVQuYfUaDUyMm5f3N3wweSAXi6gqZmdYRkTeVnByI3yxwLIBUQOgrS5reDoC8naFtY7uuFK00OTE594LZ");
require('dotenv').config();

const { Client, Intents, MessageEmbed } = require('discord.js');

//Models
const Main = require('./models/main');
const Orders = require('./models/orders')
const Awaiting_payment = require('./models/temp')
const SoldGmails = require('./models/soldgmails')


const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

var app = express()
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static('public'))

//MiddleWares
// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf
    }
  }))


app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(session({
    secret: 'niu bi ji qi ren',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

//Routes
const mainRoute = require('./routes/main')
const authRoute = require('./routes/auth')
const adminRoute = require('./routes/admin')

//Routes 2.0
app.use("/", mainRoute)
app.use("/auth",authRoute)
app.use("/admin",adminRoute)

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

//discord login
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    console.log("ne")
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'stock') {
        stockcount = await Main.findAndCountAll({raw:true})
        awaitingcount = await Awaiting_payment.findAndCountAll({raw:true})
        const newEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Stock Count')
            .addFields(
                { name: 'Gmails Stock', value: stockcount.count.toString(),inline: true },
		        { name: 'Awaiting Payment', value: awaitingcount.count.toString(),inline: true },
            )
		await interaction.reply({embeds: [newEmbed]});
	} else if (commandName === 'orderinfo') {
        const ordernum = interaction.options.getString('input')
        boughtgmails = await SoldGmails.findAll({where:{orderno:ordernum}})
        gmailstring = ""
        for(i in boughtgmails) {
            console.log(boughtgmails)
            row = boughtgmails[i].dataValues
            gmailstring += row.email + ":::" + row.password + ":::" + row.ip + ":::" + row.authuser + ":::" + row.authpass + "\t" + row.proxyexpiry + "\n" 
        }
        if (gmailstring == "") {
            await interaction.reply("Order not found")
        } else {
            await interaction.reply("```"+`Order number: #${ordernum}\nCustomer: ${boughtgmails[0].dataValues.customer}\nDiscord: ${boughtgmails[0].dataValues.discord}\nQty: ${boughtgmails.length}\nDate of purchase: ${boughtgmails[0].dataValues.datesold}\n\n`+gmailstring+"```");
        }
	} 
});

client.login(process.env.DISCORD_TOKEN)