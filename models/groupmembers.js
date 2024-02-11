const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Groupmembers = sequelize.define('groupmembers', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    role: Sequelize.STRING,
});

module.exports = Groupmembers;