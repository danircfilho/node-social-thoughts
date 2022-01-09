//Autenticação - proteger a rota (página) de acesso
//Se autenticado acesso (next), ao contrário volta para a página (login)
module.exports.checkAuth = function (req, res, next) {
  const userId = req.session.userid

  if(!userId) {
    res.redirect('/login')
  }

  next()
}