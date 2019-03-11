const {postMessage, postBotMessage} = require('./message');
const {showUpQuestionBlock, showUpResponseBlock} = require('./blocks')
const {timeZoneShift, getDateAsNumber} = require('./utils/time');
const {getStats} = require('./stats');
const {SHOW_UP_QUESTION} = require('./utils/constants');

const interaction = async function(req, state) {
  const Questions = state.models.Questions;
  const payload = JSON.parse(req.body.payload);
  let x;

  if(state.serverConfig.blocked_users.indexOf(payload.user.id) > -1) {
    postBotMessage({
      channel: payload.container.channel_id,
      user: payload.user.id,
      text: "You are not allowed to vote"
    }, "https://slack.com/api/chat.postEphemeral", state.serverConfig.bot_token)
    return ""
  }

  const question = await Questions.findOne({where: {ts: payload.message.ts}});
  if(!question) {
    console.error("Can't find question");
    return "";
  } else {
    x = question.user_name;
  }

  const action = payload.actions
    .find(action => action.block_id == "showed_up");

  if(!action) {
    console.log("Unknown interaction");
    return "";
  }

  await recordAttendance(payload, action, x, state);

  sendResponse(payload, action.action_id, x, state).then(console.log).catch(console.error);

  return "ok"
}

const recordAttendance = async function(payload, action, x, state) {
  const Attendance = state.models.Attendance;
  const showedUp = action.action_id == "x_show" ? "YES"
    : (action.action_id == "x_no_show" ? "NO" : "EXCUSED");

  const messageTimeMillis = parseInt(payload.message.ts) * 1000;
  const messageTimeLocal = new Date(timeZoneShift(messageTimeMillis, state));

  const messageDateLocal = getDateAsNumber(messageTimeLocal);

  let attendanceEntry = await Attendance.findOne({where: {date: messageDateLocal, user_name: x}});
  if(attendanceEntry) {
    const history = JSON.parse(attendanceEntry.showed_up_history);
    history.push({
      user_id: payload.user.id,
      action_time_utc: action.action_ts,
      showed_up: showedUp
    });
    await attendanceEntry.update({
      showed_up: showedUp,
      showed_up_history: JSON.stringify(history)
    })
  } else {
    await Attendance.create({
      date: messageDateLocal,
      user_name: x,
      showed_up: showedUp,
      showed_up_history: JSON.stringify([
        {
          user_id: payload.user.id,
          action_time_utc: action.action_ts,
          showed_up: showedUp
        }
      ])
    })
  }
}

const sendResponse = async function(payload, actionId, x, state) {
  const Users = state.models.Users;
  const stats = await getStats(x, state);

  const questionBlock = showUpQuestionBlock(x, true);
  const responseBlock = showUpResponseBlock(x, actionId, stats);
  const blocks = questionBlock.concat(responseBlock);

  const message = {
    blocks
  }

  return postMessage(message, payload.response_url);
}

module.exports = {
  interaction
}
