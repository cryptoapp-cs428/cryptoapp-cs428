"use strict";

// Battles have a source shape that wants to battle the target shape
module.exports = function(sequelize, DataTypes) {
    var Battle = sequelize.define("Battle", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            creationTimeUTC: { type: DataTypes.BIGINT, allowNull: false },
            battleTimeUTC: { type: DataTypes.BIGINT, allowNull: true },
            sourceWon: { type: DataTypes.BOOLEAN, allowNull: true },
            occurred: { type: DataTypes.BOOLEAN, allowNull: false },
            userEthAddressSource: { type: DataTypes.INTEGER, allowNull: false },
            userEthAddressTarget: { type: DataTypes.INTEGER, allowNull: false },
            shapeEthAddressSource: { type: DataTypes.STRING, allowNull: false },
            shapeEthAddressTarget: { type: DataTypes.STRING, allowNull: false },
        });
    return Battle;
};

