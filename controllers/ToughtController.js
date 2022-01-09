const Tought = require('../models/Tought')
const User = require('../models/User')

//funções assincronas são muito utilizadas em informações que vão ao BD
module.exports = class ToughtController {
  static async showTougths(req, res) {
    res.render('toughts/home')
  }

  static async dashboard(req, res) {
    res.render('toughts/dashboard')
  }

  static createTought(req, res) {
    res.render('toughts/create')
  }

  static async createToughtSave(req, res) {
    const tought = {
      title: req.body.title,
      UserId: req.session.userid, //dados relacionados ao id do usuário (evitar fraudes em id fake - malicioso)
    }

    await Tought.create(tought)

    req.flash('message', 'Thought created successfully!')

    try{
      //garantir que a sessão seja salva (inclusive para o flash message)
      req.session.save(() =>{
        res.redirect('/toughts/dashboard') //redirecionamento salvo
      })
    }catch (error) {
      console.log('Something went wrong!' + error)
    }
  }
}