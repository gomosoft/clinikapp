var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth');
var Credencial = require('../models/credenciales');
var Logueo = require('../models/sistemasLogueo');
var credencialCtrl = require('../controllers/credencial');
var passport = require('passport');


var getSistemaDeLogueo = function(nombre, callback){
  Logueo.findOne({nombre : nombre}, function(err,log){
    if(err || log === null) {
      // #TODO local solo deberia servir en desarrollo
      if (nombre === 'local'){
        logueo = new Logueo();
        logueo.nombre = 'local';
        logueo.key = 'local';
        logueo.secret = 'local';
        logueo.save(function(err){
          if(err) callback(err);
          else callback(null,logeo._id);
        });
      }else{
        callback({ message: 'no existe el sistema de logueo ' + nombre });
      }
    } else {
      callback(null,log._id);
    }
  });
};


passport.serializeUser(function(credencial,listo) {
  listo(null, credencial);
});

passport.deserializeUser(function(credencial,listo) {
    listo(null, credencial);
});

passport.use('registro-local', new LocalStrategy(
  { usernameField : 'email', passwordField : 'clave' },
  function(email, clave, listo){
    // TODO: checkear si el usuario existe
    if(false){
      return listo(null,false,'correro_existe'); //cada error lleva una llave que lo asocia con el json ubicado en /frontend/locales/es.json
    } else {

      var datos = {email : email, token : "na", uid : email, password : clave};


      getSistemaDeLogueo('local',function(err,log){
        datos._sistema_logueo = log;
        credencialCtrl.crear(datos, function(err,nuevaCredencial) {
          if (err) throw err;
          listo(null,nuevaCredencial);
        });
      });
    }
  }));
passport.use('ingreso-local', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'clave',
        passReqToCallback : true
    },
    function(req, email, clave, listo) {

      Credencial.findOne({ 'email' :  email }, function(err, credencial) {
        if (err)
          return listo(err);
        if (!credencial)
          return listo(null, false, "correo_no_existe");
        credencial.compararPassword(clave, function(err,iguales){
          if (err)
            return listo(err);
          if(iguales){
            console.log('logged in');
            return listo(null, credencial);
          } else {
            return listo(null, false, "contrasena_incorrecta");
          }
        });
      });

    }));
