const fetch = require('node-fetch');
const {showUpQuestionBlock} = require('./blocks');

const postMessage = async function(message, url) {

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  const responseText = await response.text();

  return responseText;
}

const postShowUpQuestion = async function(req, state) {
  const url = state.serverConfig.slack_webhook;
  const xName = state.serverConfig.x_name;

  const message = {
    blocks: showUpQuestionBlock(xName)
  }

  return postMessage(message, url);
}

module.exports = {
  postMessage,
  postShowUpQuestion
}
