"use strict";


module.exports = function(sequelize, DataTypes) {
    var Shape = sequelize.define("Shape", {
            _: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            ethAddress: { type: DataTypes.STRING, allowNull: false },
            userEthAddress: { type: DataTypes.STRING, allowNull: false },
            color: { type: DataTypes.INTEGER, allowNull: false },
            experience: { type: DataTypes.INTEGER, allowNull: false },
            level: { type: DataTypes.INTEGER, allowNull: false },
        });

    return Shape;
};

