const {ask, postBotMessage} = require('./message');
const {Op} = require('sequelize');
const {timeZoneShift} = require('./utils/time');

const runScheduler = async function(state) {
  const Users = state.models.Users;
  const Questions = state.models.Questions;
  console.log("Running scheduler");

  const nowLocal = new Date(timeZoneShift(Date.now(), state));

  if(nowLocal.getDay() == 6) {
    console.log("It is Saturday my dudes....");
    return "Done";
  } else if(nowLocal.getDay() == 0) {
    console.log("It is Sunday my dudes....");
    return "Done";
  }

  const startOfDayLocal = new Date(`${nowLocal.getFullYear()}-${nowLocal.getMonth() + 1}-${nowLocal.getDate()}`);
  const nextDayLocal = new Date(startOfDayLocal.getTime() + 24*60*60*1000)
  const startOfDayUTC = timeZoneShift(startOfDayLocal.getTime(), state, true);
  const nextDayUTC = timeZoneShift(nextDayLocal.getTime(), state, true);

  const askOnChannel = async function(x, channel_id) {
    const question = await Questions.findOne({
      where: {
        user_name: x,
        ts: {
          [Op.gte]: startOfDayUTC + "",
          [Op.lte]: nextDayUTC + ""
        }
      }
    });

    if(!question) {
      await ask({body: {user_name: x, channel_id, asking_user_id: "SCHEDULE"}}, state, true);
    } else {
      console.log("Question already asked today for " + x + " on channel " + channel_id);
    }
  }

  const users = await Users.findAll();
  const tasks = [];

  users.map(user => {
    const config = JSON.parse(user.config);
    if(config.dailySchedule) {
      config.dailySchedule.channels.map(channel_id =>
        tasks.push(askOnChannel(user.name, channel_id))
      );
    }
  });

  await Promise.all(tasks);
}

const addDailySchedule = async function(x, asking_user_id, channel_id, state) {
  const Users = state.models.Users;
  const token = state.serverConfig.bot_token;

  const userEntry = await Users.findOne({where: {name: x}});
  if(userEntry) {
    const config = JSON.parse(userEntry.config);

    if(config.dailySchedule) {
      if(config.dailySchedule.channels.indexOf(channel_id) == -1) {
        config.dailySchedule.channels.push(channel_id);
      }
    } else {
      config.dailySchedule= {channels: [channel_id]};
    }

    await userEntry.update({config: JSON.stringify(config)});
  } else {
    await Users.create({name: x, config: JSON.stringify({
      dailySchedule: {
        channels: [channel_id]
      }
    })});
  }

  postBotMessage({
    text: "Added daily schedule for " + x,
    user: asking_user_id,
    channel: channel_id
  }, "https://slack.com/api/chat.postEphemeral", token).then(console.log).catch(console.error);
}

const removeDailySchedule = async function(x, asking_user_id, channel_id, state) {
  const Users = state.models.Users;
  const token = state.serverConfig.bot_token;

  const userEntry = await Users.findOne({where: {name: x}});
  if(userEntry) {
    const config = JSON.parse(userEntry.config);

    if(config.dailySchedule) {
      const filteredChannels = config.dailySchedule.channels.filter(cid => cid != channel_id);
      if(filteredChannels.length == 0) {
        config.dailySchedule = undefined;
      } else {
        config.dailySchedule.channels = filteredChannels;
      }
    }

    await userEntry.update({config: JSON.stringify(config)});
  }

  postBotMessage({
    text: "Removed daily schedule for " + x,
    user: asking_user_id,
    channel: channel_id
  }, "https://slack.com/api/chat.postEphemeral", token).then(console.log).catch(console.error);
}

module.exports = {
  runScheduler,
  addDailySchedule,
  removeDailySchedule
}
