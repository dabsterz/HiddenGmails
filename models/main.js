const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Gmails = db.define('gmails', {
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
        type: Sequelize.STRING,
    },
});

module.exports = Gmails;