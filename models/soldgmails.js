const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const SoldGmails = db.define('soldgmails', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.STRING
    },
    ip: {
        type: Sequelize.STRING,
    },
    authuser: {
        type: Sequelize.STRING,
    },
    authpass: {
        type: Sequelize.STRING,
    },
    proxyexpiry: {
        type: Sequelize.STRING,
    },
    dateadded: {
        type: Sequelize.DATE,
    },
    datesold: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    customer: {
        type: Sequelize.STRING,
    },
    discord: {
        type: Sequelize.STRING,
    },
    orderno: {
        type: Sequelize.INTEGER,
    },
});

module.exports = SoldGmails;