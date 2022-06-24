const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const awaiting_payment = db.define('awaiting_payment', {
    awaitingid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    maintableid: {
        type: Sequelize.INTEGER,
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    recovery: {
        type: Sequelize.STRING
    },
    proxy: {
        type: Sequelize.STRING
    },
    proxyexpiry: {
        type: Sequelize.STRING
    },
    dateadded: {
        type: Sequelize.DATE
    },
    orderno: {
        type: Sequelize.STRING
    },
});

module.exports = awaiting_payment;