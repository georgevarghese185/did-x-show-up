const Sequelize = require('sequelize');
const Models = require('./models');
const readFile = require('../utils/file.js').readFile;

const setupSequelize = async () => {
  const configFile = await readFile(process.env.DB_CONFIG);
  const dbConfig = JSON.parse(configFile);

  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      dialect: dbConfig.dialect,
      host: dbConfig.host,
      port: dbConfig.port
    });

  const models = Models(sequelize);

  await sequelize.sync({ force: false });
  console.log("\nSEQUELIZE STARTED");

  return { sequelize, models }
}

module.exports = {
  setupSequelize
}
