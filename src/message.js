const fetch = require('node-fetch');
const {showUpQuestionBlock} = require('./blocks');
const {SHOW_UP_QUESTION} = require('./utils/constants')

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

const ask = async function(req, state, sync) {
  const Users = state.models.Users;
  const Questions = state.models.Questions;
  const url = "https://slack.com/api/chat.postMessage";
  const token = state.serverConfig.bot_token;
  const channel_id = req.body.channel_id;
  const user_name = req.body.user_name;
  const asking_user_id = req.body.asking_user_id;

  if((state.serverConfig.admins.indexOf(asking_user_id) == -1) && asking_user_id != "SCHEDULE") {
    console.log("User " + asking_user_id + " not allowed to ask")
    const postErrorMessage = postBotMessage({
      text: "You are not allowed to ask",
      user: asking_user_id,
      channel: channel_id
    }, "https://slack.com/api/chat.postEphemeral", token);

    if(sync) {
      await postErrorMessage;
    } else {
      postErrorMessage.then(console.log).catch(console.error);
    }

    return;
  }

  const userEntry = await Users.findOne({where: {name: user_name}});
  if(!userEntry) {
    await Users.create({name: user_name, config: JSON.stringify({})});
  }

  const payload = {
    channel: channel_id,
    blocks: showUpQuestionBlock(user_name),
    username: `Did ${user_name} Show Up?`
  }

  const postQuestion = postBotMessage(payload, url, token)
    .then(response => {
      const responsePayload = JSON.parse(response);
      if(responsePayload.ok) {
        const ts = responsePayload.ts;
        return Questions.create({user_name, ts});
      } else {
        console.error(response);
      }
    });

  if(sync) {
    await postQuestion;
  } else {
    postQuestion.catch(console.error);
  }
}

module.exports = {
  postMessage,
  postBotMessage,
  ask
}
