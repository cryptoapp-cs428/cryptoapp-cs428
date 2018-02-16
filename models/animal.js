"use strict";


module.exports = function(sequelize, DataTypes) {
    var Animal = sequelize.define("Animal", {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            userId: { type: DataTypes.STRING, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            sourceHash: { type: DataTypes.STRING, allowNull: false },
            color: { type: DataTypes.STRING, allowNull: false },
        });

    return Animal;
};
