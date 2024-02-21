const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Groupmessage = sequelize.define('groupmessage', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    message: Sequelize.STRING,
    isImage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = Groupmessage;