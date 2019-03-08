const ngrok = require('ngrok');
const {getServerConfig} = require('./utils/configs');

const setupLocalTunnel = async function() {
  const serverConfig = await getServerConfig();

  const publicUrl = await ngrok.connect({addr: serverConfig.port || 4000});
  console.log("Public URL: " + publicUrl)
}

setupLocalTunnel().catch(console.error);