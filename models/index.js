"use strict";

// load environment
require('dotenv').load();
var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");

let sequelize = new Sequelize(process.env.DB_URL, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Display all the raw SQL queries
  pool: { max: 1, min: 0, idle: 10000 },
});
var db = {};

var modelFiles = ['user.js', 'animal.js'];

// Load all model files
modelFiles.forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});

// Link associations
Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;




