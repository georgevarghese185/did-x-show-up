const Sequelize = require('sequelize');

const UsersModel = (sequelize) => {
  return sequelize.define('users', {
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
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
    user_id: {
      type: Sequelize.STRING,
      allowNull: false
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

module.exports = function(sequelize) {
  return {
    Users: UsersModel(sequelize),
    Attendance: AttendanceModel(sequelize)
  }
}
