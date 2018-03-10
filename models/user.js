"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
            _: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            ethAddress: { type: DataTypes.STRING, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: true },
            email: { type: DataTypes.STRING, allowNull: true }
        });

    return User;
};


