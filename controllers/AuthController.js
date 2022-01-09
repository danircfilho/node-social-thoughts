const User = require('../models/User')

const bcrypt = require('bcryptjs') //criptografar senha

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
    
    //initialize session (iniciar a sessão após logar)
    req.session.userid = user.id

    req.flash('message', 'Successfully authenticated!')

    //garantir que a sessão seja salva (em uma função anônima)
    req.session.save(() => {
      res.redirect('/') 
    }) 
  } 

  static register(req, res) {
    res.render('auth/register')
  }

  static async registerPost(req, res) {
    const { name, email, password, confirmpassword } = req.body
    
    //password match validation (senha igual)
    if(password != confirmpassword) {
      req.flash('message', "Passwords don't match, try again!")
      res.render('auth/register')

      return //parar a função e retornar
    }
    
    //check if the user exists (por email)
    const checkIfUserExists = await User.findOne({ where: {email: email} })

    if(checkIfUserExists) {
      req.flash('message', 'The email informed is already in use!')
      res.render('auth/register')

      return //parar a função e retornar
    }
    
    //create password (segurança para as senhas)
    const salt = bcrypt.genSaltSync(10) //salt 10 caracteres para o hash
    const hashedPassword = bcrypt.hashSync(password, salt) //hash das senhas

    const user = {
      name, 
      email,
      password: hashedPassword,
    }

    //create user in database - handle errors (tratar erros)
    try {
      const createdUser = await User.create(user)

      //initialize session (iniciar a sessão após logar)
      req.session.userid = createdUser.id

      req.flash('message', 'Registration successful!')

      //garantir que a sessão seja salva (em uma função anônima)
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

