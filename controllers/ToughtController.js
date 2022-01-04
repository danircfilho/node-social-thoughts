const Tought = require('../models/Tought')
const User = require('../models/User')

module.exports = class ToughtController {
  static async showTougths(req, res) {
    res.render('toughts/home')
  }
}