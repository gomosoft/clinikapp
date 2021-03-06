//LA MAGIA INICIA AQUÍ

// ========================= requires ===============================


var express = require('express');
var app = express();
var session = require('express-session');
var flash = require('express-flash');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var cluster = require('cluster');
var cores = require('os').cpus().length;  //numero de cpus
var passport = require('passport');
var MongoStore = require('connect-mongo')({ session: session });
var servicios = require('./config/servicios');
var vars = require('./config/vars');

// ... incluir arriba todos los requires principales


mongoose.connection.on('open', function(ref){
  return console.log('Conectado a Mongo');
});

mongoose.connection.on('error', function(err){
  console.log('no se pudo realizar la conexión con mongo');
  console.log(err);
  return console.log(err.message);
});

try {
  //nos conectamos a la base de datos
  mongoose.connect('mongodb://' + servicios.db.url );
  console.log('Iniciando conexión en: ' + ('mongodb://' + db_address) + ', esperando...');
} catch (err) {
  console.log('Conexión fallida a: ' + servicios.db.url);
}







//  ... incluir arriba todo lo relacionado con routes

// ============ app.use ===========================

app.use(multer());
// usaremos JSON raw para envío de datos en modo desarrollo de este modo
// testeamos mas rapido el api luego solo es cambiar bodyparser() por bodyparser.urlencoded()
app.use(bodyparser.urlencoded());
//le pasamos las routes al app express

var pass = require('./config/passport');
app.use(cookieParser());
app.use(session({
  secret: (process.env.SESSION_SECRET || '~cliniKApp|~@l14'),
  store: new MongoStore({
      url: 'mongodb://' + servicios.db.url,
      auto_reconnect: true
    }),
  // duración de la sesión en caso de que use cookies
  cookie : { maxAge : new Date(Date.now() + vars.ttl)}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(require('./arbiters/cross-domain'));
// ============ app.use ===========================

var router = express.Router();
    router = require('./routes/base')(router,passport);  //incluimos el archivo ./routes/base, llamamos a la función y le pasamos el router del app

app.use(router);
// ================= la route base contendrá todas las llamadas principales  ===========================




// usamos todos los cores disponibles en la máquina
// para un mejor rendimiento del app


if (cluster.isMaster) {
  for (var i = 0; i < cores; i++)
  cluster.fork();
  cluster.on('exit', function(worker, code, signal) {
    console.log(worker.process.pid);
  });
}
else {
  // Instanciamiento del app
  var pto = process.env.PORT || 8080;
  app.listen(pto);
  console.log('Magia en el puerto',pto);
}

// ===========================================================
