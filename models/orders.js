const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Orders = db.define('orders', {
    idorders: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customer: {
        type: Sequelize.STRING
    },
    discord: {
        type: Sequelize.STRING
    },
    quantity: {
        type: Sequelize.STRING
    },
    paymentintent: {
        type: Sequelize.STRING
    },
    dateadded: {
        type: Sequelize.STRING
    },
});

module.exports = Orders;