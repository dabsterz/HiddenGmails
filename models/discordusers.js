const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const DiscordUsers = db.define('discordusers', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    discordid: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
});

module.exports = DiscordUsers;