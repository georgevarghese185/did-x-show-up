const fetch = require('node-fetch');
const {showUpQuestionBlock} = require('./blocks');

const postMessage = async function(req, state) {
  const url = state.serverConfig.slack_webhook;
  const xName = state.serverConfig.x_name;

  const message = {
    blocks: showUpQuestionBlock(xName)
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  const responseText = await response.text();

  return responseText
}

module.exports = {
  postMessage
}
