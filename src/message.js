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

const ask = async function(req, state) {
  const Users = state.models.Users;
  const url = "https://slack.com/api/chat.postMessage";
  const token = state.serverConfig.bot_token;
  const channel_id = req.body.channel_id;
  const user_id = req.body.user_id;
  const user_name = req.body.user_name;

  const userEntry = await Users.findOne({where: {user_id}});
  if(!userEntry) {
    await Users.create({user_id, name: user_name, config: JSON.stringify({})});
  } else {
    if(userEntry.name != user_name) {
      await userEntry.update({name: user_name});
    }
  }



  const payload = {
    channel: channel_id,
    blocks: showUpQuestionBlock(user_id),
    username: `Did ${user_name} show up?`
  }

  return postBotMessage(payload, url, token);
}

module.exports = {
  postMessage,
  ask
}
