const Sequelize = require('sequelize');

const UsersModel = (sequelize) => {
  return sequelize.define('users', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    config: {
      type: Sequelize.TEXT('medium'),
      allowNull: false
    }
  })
}

const AttendanceModel = (sequelize) => {
  return sequelize.define('attendances', {
    date: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_name: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    showed_up: {
      type: Sequelize.STRING,
      allowNull: false
    },
    showed_up_history: {
      type: Sequelize.TEXT('medium'),
      allowNull: false
    }
  });
}

const QuestionsModel = (sequelize) => {
  return sequelize.define('questions', {
    ts: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    user_name: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });
}

module.exports = function(sequelize) {
  return {
    Users: UsersModel(sequelize),
    Questions: QuestionsModel(sequelize),
    Attendance: AttendanceModel(sequelize)
  }
}
