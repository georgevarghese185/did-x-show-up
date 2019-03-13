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

const getStats = async function(x, state) {
  const thisWeek = await getThisWeekCount(x, state);
  const last30Days = await getLast30DaysCount(x, state);
  const yearShowUpRate = await getYearShowUpRate(x, state);
  const {currentStreak, longestStreak, currentNoShowStreak, longestNoShowStreak}
    = await getStreaks(batchProcessor(x, state));

  return {
    currentStreak,
    longestStreak,
    currentNoShowStreak,
    longestNoShowStreak,
    showUpCount: {
      thisWeek,
      last30Days
    },
    yearShowUpRate
  }
}

const getThisWeekCount = async function(x, state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));
  const day = (nowLocal.getUTCDay() + 6) % 7; //We want Monday to be represented as 0

  const startOfWeek = new Date(nowLocal.getTime() - day*24*60*60*1000);
  const endOfWeek = new Date(nowLocal.getTime() + (6 - day)*24*60*60*1000);

  console.log(startOfWeek + " " + endOfWeek)

  return getCountBetween(x, getDateAsNumber(startOfWeek), getDateAsNumber(endOfWeek), state);
}

const getLast30DaysCount = async function(x, state) {
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const start = new Date(nowLocal.getTime() - 30*24*60*60*1000);

  return getCountBetween(x, getDateAsNumber(start) + 1, getDateAsNumber(nowLocal), state);
}

const getYearShowUpRate = async function(x, state) {
  const Attendance = state.models.Attendance;
  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  const start = new Date(nowLocal.getFullYear() + "-01-01");
  const daysBetween = Math.ceil((nowLocal.getTime() - start.getTime())/1000/60/60/24);

  const entries = await Attendance.findAll({
    where: {
      date: {
        [Op.gte]: getDateAsNumber(start),
        [Op.lte]: getDateAsNumber(nowLocal)
      },
      user_name: x
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

const getCountBetween =  async function(x, start, end, state) {
  const Attendance = state.models.Attendance;

  let entries = await Attendance.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lte]: end
      },
      user_name: x
    }
  });

  return entries.reduce((count, entry) => {
    return count + (entry.showed_up == "YES" ? 1 : 0)
  }, 0);
}

const batchProcessor = function(x, state) {
  const Attendance = state.models.Attendance;

  let offset = 0;
  let batches = 365;

  const getNextBatch = async function() {
    const entries = await Attendance.findAll({
      where: {user_name: x},
      order: [['date', 'DESC']],
      limit: batches,
      offset: offset
    });

    offset += entries.length;
    return entries;
  }

  return getNextBatch;
}

const getStreaks = async function(getNextBatch) {
  let latest = null;

  let showStreaks = {
    current: 0,
    longest: 0,
    count: 0,
    streakBroken: false
  }

  let noShowStreaks = {
    current: 0,
    longest: 0,
    count: 0,
    streakBroken: false
  }

  let entries = await getNextBatch();
  while(entries.length > 0) {
    for(let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if(entry.showed_up == "YES") {
        if(!noShowStreaks.streakBroken) {
          noShowStreaks.streakBroken = true;
        }
        noShowStreaks.count = 0;

        if(!showStreaks.streakBroken) {
          showStreaks.current++;
        }
        showStreaks.count++;
        if(showStreaks.longest < showStreaks.count) {
          showStreaks.longest = showStreaks.count;
        }
      } else if(entry.showed_up == "NO") {
        if(!showStreaks.streakBroken) {
          showStreaks.streakBroken = true;
        }
        showStreaks.count = 0;

        if(!noShowStreaks.streakBroken) {
          noShowStreaks.current++;
        }
        noShowStreaks.count++;
        if(noShowStreaks.longest < noShowStreaks.count) {
          noShowStreaks.longest = noShowStreaks.count;
        }
      }
    }
    entries = await getNextBatch();
  }

  return {
    currentStreak: showStreaks.current,
    currentNoShowStreak: noShowStreaks.current,
    longestStreak: showStreaks.longest,
    longestNoShowStreak: noShowStreaks.longest
  };
}

module.exports = {
  getStats,
  getStreaks
}
