const {postMessage} = require('./message');
const {showUpQuestionBlock, showUpResponseBlock} = require('./blocks')

const interaction = async function(req, state) {
  const payload = JSON.parse(req.body.payload);

  const action = payload.actions
    .find(action => action.block_id == "showed_up");

  if(!action) {
    console.log("Unknown interaction");
    return "";
  }

  await recordAttendance(payload, action, state);

  sendResponse(payload, action.action_id, state).then(console.log).catch(console.error);

  return "ok"
}

const recordAttendance = async function(payload, action, state) {
  const Attendance = state.models.Attendance;
  const showedUp = action.action_id == "x_show" ? "YES"
    : (action.action_id == "x_no_show" ? "NO" : "EXCUSED");

  const messageTimeStamp = parseInt(payload.message.ts) * 1000;
  const timeZone = state.serverConfig.time_zone || 0;
  const timeZoneShift = timeZone * 60 * 60 * 1000;
  const messageTimeLocal = new Date(messageTimeStamp + timeZoneShift);

  const messageDateLocal = parseInt(
    messageTimeLocal.toISOString().substring(0, 10).replace(/\-/g, "")
  );

  let attendanceEntry = await Attendance.findOne({where: {date: messageDateLocal}});
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

const sendResponse = async function(payload, actionId, state) {
  const xName = state.serverConfig.x_name;
  const questionBlock = showUpQuestionBlock(xName);
  const responseBlock = showUpResponseBlock(xName, actionId, {
    currentStreak: "3",
    longestStreak: "5",
    showUpCount: {
      thisWeek: "2",
      last30Days: "4"
    },
    yearShowUpRate: "89"
  });
  const blocks = questionBlock.concat(responseBlock);

  const message = {
    blocks
  }

  return postMessage(message, payload.response_url);
}

module.exports = {
  interaction
}
