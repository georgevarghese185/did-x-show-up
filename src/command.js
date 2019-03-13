const message = require('./message')
const {addDailySchedule, removeDailySchedule} =  require('./schedule');

const getCommandName = function(url) {
  return url.substring(url.lastIndexOf('/') + 1)
}

const command = async function(req, state) {
  const commandName = getCommandName(req.url);
  switch(commandName) {
    case "ask":
      return ask(req, state);
      break;
    case "schedule":
      return schedule(req, state);
    case "removeSchedule":
      return removeSchedule(req, state);
    default:
      return {
        error: true,
        text: "Unknown command"
      }
      break;
  }
}

const schedule = async function(req, state) {
  const x = req.body.text;
  const token = state.serverConfig.bot_token
  const asking_user_id = req.body.user_id;
  const channel_id = req.body.channel_id;

  if(state.serverConfig.admins.indexOf(asking_user_id) == -1) {
    message.postBotMessage({
      text: "You don't have permission to create a schedule",
      user: asking_user_id,
      channel: channel_id
    }, "https://slack.com/api/chat.postEphemeral", token).then(console.log).catch(console.error);
    return;
  }

  await addDailySchedule(x, asking_user_id, channel_id, state);
}

const removeSchedule = async function(req, state) {
  const x = req.body.text;
  const token = state.serverConfig.bot_token
  const asking_user_id = req.body.user_id;
  const channel_id = req.body.channel_id;

  if(state.serverConfig.admins.indexOf(asking_user_id) == -1) {
    message.postBotMessage({
      text: "You don't have permission to remove a schedule",
      user: asking_user_id,
      channel: channel_id
    }, "https://slack.com/api/chat.postEphemeral", token).then(console.log).catch(console.error);
    return;
  }

  await removeDailySchedule(x, asking_user_id, channel_id, state);
}

const ask = async function(req, state) {
  const user_name = req.body.text;
  const asking_user_id = req.body.user_id;
  const channel_id = req.body.channel_id;

  await message.ask({body: {user_name, asking_user_id, channel_id}}, state);
}

module.exports = {
  command
}
