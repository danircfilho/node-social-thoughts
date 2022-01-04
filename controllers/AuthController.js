const User = require('../models/User')

const bcrypt = require('bcryptjs') //criptografar senha

module.exports = class AuthController {
    static login(req, res) {
      res.render('auth/login')
  }

  static register(req, res) {
    res.render('auth/register')
  }

  static async registerPost(req, res) {
    const { name, email,  password, confirmpassword } = req.body
    
    //password match validation (senha igual)
    if(password != confirmpassword) {
      req.flash('message', "Passwords don't match, try again!")
      res.render('auth/register')

      return //parar a função e retornar
    }
  }
}
