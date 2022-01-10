const Tought = require('../models/Tought')
const User = require('../models/User')

//Op - do sequelize para filtrar as buscas
const { Op } = require('sequelize')
const { query } = require('express')

//funções assincronas são muito utilizadas em informações que vão ao BD
module.exports = class ToughtController {
  static async showTougths(req, res) {

    //busca
    let search = '' //let pois vai mudar

    if (req.query.search) {
      search = req.query.search
    }

    //ordem de busca (começa a ordenação antes do filtro pelo mais novo - DESC - descendent)
    let order = 'DESC'
    
    //ao aplicar o filtro
    if (req.query.order === 'old') {
      order = 'ASC'
    } else {
      order = 'DESC'
    }

    const toughtsData = await Tought.findAll({
      include: User,
      where: {
         //filtar o operador com like (palavras no começo, meio ou no fim com termo buscado)
         //entre os operadores % %
        title: { [Op.like]: `%${search}%` },
      },
      order: [['createdAt', order]], //createdAt - sequelize estabelece a data automaticamente
    })

    //Não somente o que há no dataValue, buscamos o User pelo
    const toughts = toughtsData.map((result) => result.get({ plain: true }))

    //contar quantos termos foram encontrados na busca
    let toughtsQty = toughts.length

    if (toughtsQty === 0) {
      toughtsQty = false
    }

    res.render('toughts/home', { toughts, search, toughtsQty })
  }

  static async dashboard(req, res) {
    const userId = req.session.userid

    const user = await User.findOne({
      where: {
        id: userId,
      },
      //sequelize - trá todos os pensamentos do id criado (userId)
      include: Tought, 
      plain: true,
    })

    //check if use exists
    if (!user) {
      res.redirect('/login') //caso não haja o usuário será redirecionado
    }

    const toughts = user.Toughts.map((result) => result.dataValues) //filtrar e trazer apenas dataValues

    //lógica que será renderizada na página
    //neste caso serve para verificar e informar ausencia de 'pensamento' (escritos do usuário)
    let emptyToughts = false //renderizar sempre falso (variavel let pois irá mudar)

    //se houver palavras renderiza verdadeiro, ou seja, aparece na tela
    if (toughts.length === 0) {
      emptyToughts = true
    }

    res.render('toughts/dashboard', { toughts, emptyToughts })
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
      console.log('Something went wrong!: ' + error)
    }
  }

  static async removeTought(req, res) {
    
    const id = req.body.id
    const UserId = req.session.userid

    try{
      await Tought.destroy({where: {id: id, UserId: UserId} })

      req.flash('message', 'Thought removed successfully!')

      req.session.save(() =>{
        res.redirect('/toughts/dashboard')
      })
    }catch (error) {
      console.log('Something went wrong!: ' + error)
    }
  }

  static async updateTought(req, res) {
    
    const id = req.params.id //params porque vem pela url
    
    const tought = await Tought.findOne({ where: {id: id}, raw: true }) //raw resolve (somente busca o dado)

    res.render('toughts/edit', {tought})
  }

  static async updateToughtSave(req, res) {
    
    const id = req.body.id //este serve para o filtro

    //dado a ser atualizado
    //tought (objeto) a ser atualizado
    const tought = {
      title: req.body.title
    }

    try{
      await Tought.update(tought, { where: {id: id} }) 

      req.flash('message', 'Thought successfully updated!')

      req.session.save(() =>{
        res.redirect('/toughts/dashboard')
      })
    }catch (error) {
      console.log('Something went wrong!: ' + error)
    }
  }
}