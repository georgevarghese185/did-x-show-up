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
  const day = (nowLocal.getUTCDay() + 6) % 7; //We want Monday to be represented as 0

  const startOfWeek = new Date(nowLocal.getTime() - day*24*60*60*1000);
  const endOfWeek = new Date(nowLocal.getTime() + (6 - day)*24*60*60*1000);

  console.log(startOfWeek + " " + endOfWeek)

  return getCountBetween(getDateAsNumber(startOfWeek), getDateAsNumber(endOfWeek), state);
}

const getLast30DaysCount = async function(state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const start = new Date(nowLocal.getTime() - 30*24*60*60*1000);

  return getCountBetween(getDateAsNumber(start) + 1, getDateAsNumber(nowLocal), state);
}

const getYearShowUpRate = async function(state) {
  const Attendance = state.models.Attendance;
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const start = new Date(nowLocal.getFullYear() + "-01-01");
  const daysBetween = Math.ceil((nowLocal.getTime() - start.getTime())/1000/60/60/24);

  const entries = await Attendance.findAll({
    where: {
      date: {
        [Op.gte]: getDateAsNumber(start),
        [Op.lte]: getDateAsNumber(nowLocal)
      }
    }
  });

  const {total, showedUp} = entries.reduce((count, entry) => {
    if(entry.showed_up == "YES" || entry.showed_up == "NO") {
      count.total++;
      if(entry.showed_up == "YES") {
        count.showedUp++;
      }
    }
    return count;
  }, {total: 0, showedUp: 0});

  if(total == 0) {
    return 0;
  } else {
    return Math.round(showedUp/total*100*100) / 100;
  }
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
