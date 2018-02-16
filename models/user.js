"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            email: { type: DataTypes.STRING, allowNull: false },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            verified: { type: DataTypes.BOOLEAN, allowNull: false },
            verifyCode: { type: DataTypes.STRING, allowNull: false },
            color: { type: DataTypes.STRING, allowNull: false }
        });

    return User;
};


