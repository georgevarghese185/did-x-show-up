const timeZoneShift = function(timeMillis, state) {
  const timeZone = state.serverConfig.time_zone || 0;
  return timeMillis + timeZone * 60 * 60 * 1000;
}

const getDateAsNumber = function(date) {
  return parseInt(date.toISOString().substring(0,10).replace(/\-/g, ""))
}

module.exports = {
  timeZoneShift,
  getDateAsNumber
}
