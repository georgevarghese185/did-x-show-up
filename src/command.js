const message = require('./message')


const getCommandName = function(url) {
  return url.substring(url.lastIndexOf('/') + 1)
}

const command = async function(req, state) {
  const commandName = getCommandName(req.url);
  switch(commandName) {
    case "ask":
      return ask(req, state);
      break;
    case "blockUser":
      return blockUser(req, state);
      break;
    case "unblockUser":
      return unblockUser(req, state);
      break;
    case "stats":
      return stats(req, state);
      break;
    default:
      return {
        error: true,
        text: "Unknown command"
      }
      break;
  }
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