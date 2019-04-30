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

  await Promise.all(
    payload.actions.map(async action => {
      if(action.block_id == "showed_up") {
        let {firstAnsweredBy} = await recordAttendance(payload, action, x, state);
        sendResponse(payload, action.action_id, x, firstAnsweredBy, state).then(console.log).catch(console.error);
      } else if(action.block_id == "reset") {
        resetQuestion(x, payload).then(console.log).catch(console.error);
      } else {
        console.log("Unknown interaction");
        return "";
      }
    })
  );
}

const recordAttendance = async function(payload, action, x, state) {
  const Attendance = state.models.Attendance;
  const showedUp = action.action_id == "x_show" ? "YES"
    : (action.action_id == "x_no_show" ? "NO" : "EXCUSED");

  const messageTimeMillis = parseInt(payload.message.ts) * 1000;
  const messageTimeLocal = new Date(timeZoneShift(messageTimeMillis, state));

  const messageDateLocal = getDateAsNumber(messageTimeLocal);

  let attendanceEntry = await Attendance.findOne({where: {date: messageDateLocal, user_name: x}});
  let firstAnsweredBy;
  if(attendanceEntry) {
    const history = JSON.parse(attendanceEntry.showed_up_history);
    const firstSubmission = history.find(h => h.showed_up == showedUp);
    if(firstSubmission != null) {
      firstAnsweredBy = firstSubmission.user_id;
    } else {
      firstAnsweredBy = payload.user.id;
    }
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
    firstAnsweredBy = payload.user.id;
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

  return {firstAnsweredBy}
}

const sendResponse = async function(payload, actionId, x, firstAnsweredBy, state) {
  const Users = state.models.Users;
  const stats = await getStats(x, state);

  const blocks = showUpResponseBlock(x, actionId, firstAnsweredBy, stats);

  const message = {
    blocks
  }

  return postMessage(message, payload.response_url);
}

const resetQuestion = async function(x, payload) {

  const message = {
    blocks: showUpQuestionBlock(x)
  }

  return postMessage(message, payload.response_url);
}

module.exports = {
  interaction
}
