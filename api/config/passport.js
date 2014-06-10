var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth');
var Credencial = require('../models/credenciales');
var Logueo = require('../models/sistemasLogueo');

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
        console.log({ message: 'no existe el sistema de logueo ' + nombre });
        callback(err);
      }
    } else {
      callback(null,log._id);
    }
  });
};

var existeCredencial = function(){
};

module.exports = function(passport) {
  passport.serializeUser(function(usuario,listo) {
    listo(null, usuario.id);
  });
  passport.deserializeUser(function(usuario,listo) {
    usuario.findById(id, function(err, usuario){
      listo(err, usuario);
    });
  });
  passport.use(new LocalStrategy({
    usernameField : 'email',
    passwordField : 'clave'
  },
  function(email, clave, listo){
    // TODO: checkear si el usuario existe
    if(false){
      return listo(null,false,'ya hay un usuario con ese correo');
    } else {
      var nuevaCredencial = new Credencial();
      nuevaCredencial.email = email;
      nuevaCredencial.token = clave;
      nuevaCredencial.uid = email;
      getSistemaDeLogueo('local',function(err,log){
        nuevaCredencial._id_sistema_logueo = log;
        nuevaCredencial.save(function(err) {
          if (err) throw err;
          return listo(null, nuevaCredencial);
        });
      });
    }
  }));
};