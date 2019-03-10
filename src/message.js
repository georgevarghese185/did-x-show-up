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

const postBotMessage = async function(payload, url, token) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();

  return responseText;
}

const postShowUpQuestion = async function(req, state) {
  const url = "https://slack.com/api/chat.postMessage";
  const token = state.serverConfig.bot_token;
  const xName = state.serverConfig.x_name;

  const payload = {
    channel: req.body.channel_id,
    blocks: showUpQuestionBlock(xName)
  }

  return postBotMessage(payload, url, token);
}

module.exports = {
  postMessage,
  postShowUpQuestion
}
