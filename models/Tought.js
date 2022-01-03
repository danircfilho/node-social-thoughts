const { DataTypes } = require('sequelize')

const db =  require('../db/conn')

const User = require('./User')

const Tought = db.define('Tought', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    require: true,
  }
})

Tought.belongsTo(User) //Toughts (pensamentos) pertence a 01 usuário (User)
User.hasMany(Tought) //01 usuário (User) possui vários pensamentos (Toughts) 

module.exports = Tought 