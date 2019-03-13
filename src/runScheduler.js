const Sequelize = require('./db/sequelize');
const {getServerConfig} = require('./utils/configs')
const {runScheduler} =  require('./schedule');

const run = async function() {
  const {sequelize, models} = await Sequelize.setupSequelize();
  let serverConfig = await getServerConfig();
  await runScheduler({sequelize, models, serverConfig});
}

run().then(() => {
  console.log("Scheduler done");
  process.exit();
}).catch(console.error)
