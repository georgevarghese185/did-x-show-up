
const interaction = async function(req, state) {
  const Attendance = state.models.Attendance;
  const payload = JSON.parse(req.body.payload);

  const action = payload.actions
    .find(action => action.block_id == "showed_up");

  if(!action) {
    console.log("Unknown interaction");
    return "";
  }

  const showedUp = action.action_id == "x_show";

  const messageTimeStamp = parseInt(payload.message.ts) * 1000;
  const timeZone = state.serverConfig.time_zone || 0;
  const timeZoneShift = timeZone * 60 * 60 * 1000;
  const messageTimeLocal = new Date(messageTimeStamp + timeZoneShift);

  const messageDateLocal = messageTimeLocal.toISOString().substring(0, 10);

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

  return "ok"
}

module.exports = {
  interaction
}
