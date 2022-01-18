const User = require('../models/User')

const bcrypt = require('bcryptjs')

module.exports = class AuthController {
    static login(req, res) {
      res.render('auth/login')
  }

    static async loginPost(req, res) {
    const { email, password } = req.body
    
    //find user
    const user = await User.findOne({ where: {email: email} })
    
    if (!user) {
      req.flash('message', 'User not found!')
      res.render('auth/login')
      
      return
    }  
    
    //check if passwords match
    const passwordMatch = bcrypt.compareSync(password, user.password)
    
    if (!passwordMatch) {
      req.flash('message', 'Invalid password!')
      res.render('auth/login')
      
      return
    }  
    
    //initialize session
    req.session.userid = user.id

    req.flash('message', 'Successfully authenticated!')

    //save session
    req.session.save(() => {
      res.redirect('/') 
    }) 
  } 

  static register(req, res) {
    res.render('auth/register')
  }

  static async registerPost(req, res) {
    const { name, email, password, confirmpassword } = req.body
    
    //password match validation
    if(password != confirmpassword) {
      req.flash('message', "Passwords don't match, try again!")
      res.render('auth/register')

      return
    }
    
    //check if the user exists (email)
    const checkIfUserExists = await User.findOne({ where: {email: email} })

    if(checkIfUserExists) {
      req.flash('message', 'The email informed is already in use!')
      res.render('auth/register')

      return 
    }
    
    //create password - hash
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    const user = {
      name, 
      email,
      password: hashedPassword,
    }

    //create user in database - handle errors 
    try {
      const createdUser = await User.create(user)

      
      req.session.userid = createdUser.id

      req.flash('message', 'Registration successful!')

      
      req.session.save(() => {
        res.redirect('/') 
      }) 
    }
    catch (err) {
      console.log(err)
    }
  }

  static logout(req, res) {
    req.session.destroy()
    res.redirect('/login')
  }
}

