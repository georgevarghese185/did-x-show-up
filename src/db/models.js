const Sequelize = require('sequelize');

const AttendanceModel = (sequelize) => {
  return sequelize.define('attendance', {
    date: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    showed_up: {
      type: Sequelize.STRING,
      allowNull: false
    },
    showed_up_history: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });
}

module.exports = function(sequelize) {
  return {
    Attendance: AttendanceModel(sequelize)
  }
}
