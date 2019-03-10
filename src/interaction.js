const {postMessage} = require('./message');
const {showUpQuestionBlock, showUpResponseBlock} = require('./blocks')
const {timeZoneShift, getDateAsNumber} = require('./utils/time');
const {getStats} = require('./stats');

const interaction = async function(req, state) {
  const payload = JSON.parse(req.body.payload);
  const x_id = req.body.payload.match(/<@([\d\w]+)>/)[1];

  const action = payload.actions
    .find(action => action.block_id == "showed_up");

  if(!action) {
    console.log("Unknown interaction");
    return "";
  }

  await recordAttendance(payload, action, x_id, state);

  sendResponse(payload, action.action_id, x_id, state).then(console.log).catch(console.error);

  return "ok"
}

const recordAttendance = async function(payload, action, x_id, state) {
  const Attendance = state.models.Attendance;
  const showedUp = action.action_id == "x_show" ? "YES"
    : (action.action_id == "x_no_show" ? "NO" : "EXCUSED");

  const messageTimeMillis = parseInt(payload.message.ts) * 1000;
  const messageTimeLocal = new Date(timeZoneShift(messageTimeMillis, state));

  const messageDateLocal = getDateAsNumber(messageTimeLocal);

  let attendanceEntry = await Attendance.findOne({where: {date: messageDateLocal, user_id: x_id}});
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
      user_id: x_id,
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

const sendResponse = async function(payload, actionId, x_id, state) {
  const Users = state.models.Users;
  const stats = await getStats(state);

  const questionBlock = showUpQuestionBlock(x_id, true);
  const responseBlock = showUpResponseBlock(x_id, actionId, stats);
  const blocks = questionBlock.concat(responseBlock);

  const message = {
    blocks
  }

  return postMessage(message, payload.response_url);
}

module.exports = {
  interaction
}
