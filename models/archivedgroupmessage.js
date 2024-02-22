const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Archivedgroupmessage = sequelize.define('archivedgroupmessage', {
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
    },
    userId: Sequelize.INTEGER,
    groupId: Sequelize.INTEGER
});

module.exports = Archivedgroupmessage;