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
  const currentStreak = await getCurrentStreak(state);
  const longestStreak = await getLongestStreak(state);
  const thisWeek = await getThisWeekCount(state);
  const last30Days = await getLast30DaysCount(state);
  const yearShowUpRate = await getYearShowUpRate(state);

  return {
    currentStreak,
    longestStreak,
    showUpCount: {
      thisWeek,
      last30Days
    },
    yearShowUpRate
  }
}

const getThisWeekCount = async function(state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const startOfWeek = new Date(nowLocal.getTime() - nowLocal.getUTCDay()*24*60*60*1000);
  const endOfWeek = new Date(nowLocal.getTime() + (6 - nowLocal.getUTCDay())*24*60*60*1000);

  console.log(startOfWeek + " " + endOfWeek)

  return getCountBetween(getDateAsNumber(startOfWeek) + 1, getDateAsNumber(endOfWeek), state);
}

const getLast30DaysCount = async function(state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const start = new Date(nowLocal.getTime() - 30*24*60*60*1000);

  return getCountBetween(getDateAsNumber(start) + 1, getDateAsNumber(nowLocal), state);
}

const getYearShowUpRate = async function(state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const start = new Date(nowLocal.getFullYear() + "-01-01");
  const daysBetween = Math.ceil((nowLocal.getTime() - start.getTime())/1000/60/60/24);

  const count = await getCountBetween(getDateAsNumber(start), getDateAsNumber(nowLocal), state);
  const ratePercent = (count/daysBetween)*100;
  return Math.round(ratePercent * 100)/100;
}

const getCountBetween =  async function(start, end, state) {
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

const batchProcessor = function(state) {
  const Attendance = state.models.Attendance;

  let offset = 0;
  let batches = 365;

  const getNextBatch = async function() {
    const entries = await Attendance.findAll({
      order: [['date', 'DESC']],
      limit: batches,
      offset: offset
    });

    offset += entries.length;
    return entries;
  }

  return getNextBatch;
}

const getCurrentStreak = async function(state) {
  const getNextBatch = batchProcessor(state);

  let count = 0;
  let entries = await getNextBatch();

  while(entries.length > 0) {
    for(let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if(entry.showed_up == "NO") {
        break;
      } else if(entry.showed_up == "YES") {
        count++;
      }
    }
    entries = await getNextBatch();
  }

  return count;
}

const getLongestStreak = async function(state) {
  const getNextBatch = batchProcessor(state);

  let count = 0;
  let longestStreak = 0;
  let entries = await getNextBatch();

  while(entries.length > 0) {
    for(let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if(entry.showed_up == "NO") {
        if(count > longestStreak) longestStreak = count;
        count = 0;
      } else if(entry.showed_up == "YES") {
        count++;
      }
    }
    entries = await getNextBatch();
  }

  return longestStreak;
}

module.exports = {
  getStats
}
