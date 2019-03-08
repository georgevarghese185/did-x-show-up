const express = require('express');
const ngrok = require('ngrok');

const Sequelize = require('./db/sequelize');
const Middleware = require('./middleware');
const Routes = require('./routes');
const {readFile} = require('./utils/file')

const app = express();
const PORT = 4000;

const start = async (app) => {
  console.log("Setting up Sequelize");
  const {sequelize, models} = await Sequelize.setupSequelize();

  let serverConfig = JSON.parse(await readFile(process.env.SERVER_CONFIG));

  console.log("\nSetting up Express");
  Middleware(app, sequelize);
  Routes(app, {sequelize, models, serverConfig});

  console.log("\nStarting Server");
  await new Promise((resolve, reject) => {app.listen(PORT, resolve)});
  console.log("\nServer Started!");
  console.log(`\n\nListening on ${PORT}`);

  if(process.env.ENV === "DEV") {
    const publicUrl = await ngrok.connect();
    console.log("Public URL: " + publicUrl)
  }
}

start(app)
  .catch(e => {
    console.error(`\n\nFAILED TO START SERVER: ${e.toString()}`);
  });
