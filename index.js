const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
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

//receive response from the body
app.use(
  express.urlencoded({
    extended: true
  })
)

//receive data in JSON
app.use(express.json())

//sessions - where sessions will be saved
app.use(
  session({
    name: 'session', 
    secret: 'nosso_secret', 
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function() {},
      path: require('path').join(require('os').tmpdir(), 'sessions'),
    }),
    cookie: {
      secure: false,
      maxAge: 360000, //01 day
      expires: new Date(Date.now() + 360000),
      httpOnly: false //localhost = true
    }
  })
)

//flash messages
app.use(flash())

//public  patch - assets 
app.use(express.static('public'))

//set session to res
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

//Heroku - Porta
const PORT = process.env.PORT

conn
//.sync({force: true}) - Warning!!!
.sync()
.then(() => {
  app.listen(PORT)
})
.catch((err) => console.log(err))
