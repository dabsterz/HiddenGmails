const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport')
const DiscordUsers = require('../models/discordusers')
require('dotenv').config();

passport.serializeUser((user,done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done)=>{
    const user = await DiscordUsers.findByPk(id);
    if (user) done(null, user.dataValues)
})

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_OAUTH_CLIENTID,
    clientSecret: process.env.DISCORD_OAUTH_CLIENTSECRET,
    callbackURL: process.env.DISCORD_CLIENTREDIRECT,
    scope: ['identify', 'email', 'guilds', 'guilds.members.read']
}, async (accesstoken, refreshtoken, profile, done)=> {
    console.log(accesstoken)
    console.log(profile.username)
    try {
        const user = await DiscordUsers.findOne({where: {discordid:profile.id}})
        if (user) {
            console.log(user.dataValues)
            done(null, user.dataValues);
        } else {
            const newUser = await DiscordUsers.create({
                discordid: profile.id,
                username: profile.username + "#" + profile.discriminator
            });
            console.log(newUser.dataValues)
            done(null,newUser.dataValues)
        }
    } catch (err) {
        console.log(err)
    }
}))