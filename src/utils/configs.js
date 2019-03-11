const {readFile} = require('./file');
const path = require('path');

const DEFAULT_SERVER_CONFIG_PATH = path.join(__dirname, "../../configs/sensitive/server-config.json")
const DEFAULT_DB_CONFIG_PATH = path.join(__dirname, "../../configs/sensitive/db-config.json")

const getServerConfig = async function() {
  let serverConfig;
  try {
    serverConfig = JSON.parse(await readFile(process.env.SERVER_CONFIG || DEFAULT_SERVER_CONFIG_PATH));
    if(typeof serverConfig.interaction_id != "string") {
      throw new Error("interaction_id missing from config");
    }

    if(typeof serverConfig.command_id != "string") {
      throw new Error("command_id missing from config");
    }

    if(typeof serverConfig.bot_token != "string") {
      throw new Error("bot_token missing from config");
    }

    if(!Array.isArray(serverConfig.admins)) {
      throw new Error("admins array missing from config");
    }

    return serverConfig;
  } catch(e) {
    console.error(e)
    throw new Error("Could not find/read Server Config file. Make sure you either define it in " +
    "'/configs/sensitive/server-config.json' or define a custom path to your server config as a SERVER_CONFIG environment variable" +
    "\nEg: export SERVER_CONFIG=~/MyConfigs/did-x-show-up-server-config.json");
  }
}

const getDbConfig = async function() {
  let serverConfig;
  try {
    dbConfig = JSON.parse(await readFile(process.env.SERVER_CONFIG || DEFAULT_DB_CONFIG_PATH));
    if(typeof dbConfig.username != "string") {
      throw new Error("username missing from db config");
    }
    if(typeof dbConfig.database != "string") {
      throw new Error("database missing from db config");
    }
    if(typeof dbConfig.dialect != "string") {
      throw new Error("dialect missing from db config");
    }
    if(typeof dbConfig.port != "string") {
      throw new Error("port missing from db config");
    }
    if(typeof dbConfig.host != "string") {
      throw new Error("host missing from db config");
    }

    return dbConfig;
  } catch(e) {
    console.error(e)
    throw new Error("Could not find/read DB Config file. Make sure you either define it in " +
    "'/configs/sensitive/db-config.json' or define a custom path to your DB config as a DB_CONFIG environment variable" +
    "\nEg: export DB_CONFIG=~/MyConfigs/did-x-show-up-db-config.json");
  }
}

module.exports = {
  getServerConfig,
  getDbConfig
}
