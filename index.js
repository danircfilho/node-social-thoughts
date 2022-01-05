const express = require('express')
const exphbs = require('express-handlebars')
const  session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')

//Models
const Tought = require('./models/Tought')
const User = require('./models/User')

//Import Routes
const toughtsRoutes = require('./routes/toughtsRoutes')
const authRoutes = require('./routes/authRoutes')

//Import Controllers
const ToughtController = require('./controllers/ToughtController')


//template engine
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

//receive response from the body (receber do body)
app.use(
  express.urlencoded({
    extended: true
  })
)

//receive data in JSON (receber em JSON)
app.use(express.json())

//sessions - where sessions will be saved (sessões salvas)
app.use(
  session({
    name: 'session', //nome padrão
    secret: 'nosso_secret', //proteger as sessões do usuário
    resave: false, //caiu a sessão desconecta
    saveUninitialized: false,
    //onde será salvo (store) - 'path', 'os' (core modules) - caminho para salvar na pasta sessions (servidor)
    store: new FileStore({
      logFn: function() {},
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 360000, //equivale a 01 dia
      expires: new Date(Date.now() + 360000),
      httpOnly: true //em produção, para https deve-se mudar esta configuração (certificado de segurança)
    }
  })
)

//flash messages (feedback do sistema sobre mudanças - status do sistema)
app.use(flash())

//public  patch - assets (pasta padrão para imagens, css, etc)
app.use(express.static('public'))

//set session to res - sessão de resposta
//nota, sempre será seguido (next), entretanto se o usuário estiver logado (id) vai para a sessão dele
app.use((req, res, next) => {

  if(req.session.userid) {
    res.locals.session = req.session
  }

  next()
  
})

//Routes
app.use('/toughts', toughtsRoutes)
app.use('/', authRoutes)

app.get('/', ToughtController.showTougths)


conn
//.sync({force: true})
.sync()
.then(() => {
  app.listen(3000)
})
.catch((err) => console.log(err))
