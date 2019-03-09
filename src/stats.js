const {Op} = require('sequelize');
const {timeZoneShift, getDateAsNumber} = require('./utils/time');
/*

{
  currentStreak: "3",
  longestStreak: "5",
  showUpCount: {
    thisWeek: "2",
    last30Days: "4"
  },
  yearShowUpRate: "89"
}

*/

const getStats = async function(state) {
  const thisWeek = await getThisWeekCount(state);
  const last30Days = await getLast30DaysCount(state);

  return {
    showUpCount: {
      thisWeek,
      last30Days
    }
  }
}

const getThisWeekCount = async function(state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const startOfWeek = new Date(nowLocal.getTime() - nowLocal.getDay()*24*60*60*1000);
  const endOfWeek = new Date(nowLocal.getTime() + (7 - nowLocal.getDay())*24*60*60*1000);

  return getCountBetween(getDateAsNumber(startOfWeek) + 1, getDateAsNumber(endOfWeek), state);
}

const getLast30DaysCount = async function(state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const start = new Date(nowLocal.getTime() - 30*24*60*60*1000);

  return getCountBetween(getDateAsNumber(start) + 1, getDateAsNumber(nowLocal), state);
}

const getCountBetween =  async function(start, end, state) {
  console.log("Finding count between " + start + " and " + end)
  const Attendance = state.models.Attendance;

  let entries = await Attendance.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lte]: end
      }
    }
  });

  return entries.reduce((count, entry) => {
    return count + (entry.showed_up == "YES" ? 1 : 0)
  }, 0);
}

module.exports = {
  getStats
}
