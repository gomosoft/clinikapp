var mongoose  =  require('mongoose');
var Schema  =  mongoose.Schema;
var should = require('should');


// ==== usaremos el caracter _ para diferenciar los campos que se relacionan a otras colecciones

// ............... es un helper para diferenciar facilmente que es un campo  populable

var usuarioSchema = new Schema({

	nombres : {type : String, required : true},    //los 2 nombres delimitados por coma (,) ej. Alberto,Andres
	apellidos : {type : String, required: true},   //la misma estructura que para los nombres ej. Acosta, Arteta	
	sexo : {type : Number, required : true},
	_tipo_doc : {type : Schema.Types.ObjectId, required : true, ref : 'tiposDocs'},
	numero_doc : {type : Number, required: true},
	fecha_nacimiento : {type : Date, require : true},
	divipola : {type : String, required : true},
	telefono : String,
	email : { type : String , required : true},
	email_verificado : { type : Boolean , default : false},
	organizaciones : {type : Schema.Types.ObjectId, ref : 'usuario_organizacion'},
	fecha_registro : {type : Date}

});





// ===================== mongoose middleware ====================================


// ... esto nos sirve para validar los datos que se ingresarán a la base de datos

 
usuarioSchema.pre('save', function(next){

	usr = this;

	usr.organizaciones = this._id;

	next();

}); 


 usuarioSchema.path('nombres').validate(function(datos){

   
   var validar = require('../helpers/validador.js');

 
   //verificamos si las variables contienen el formato adecuado...


   if(this.telefono)   
    if(!validar.tel(this.telefono)) return false;  //validamos el telefono
  

   if(this.email)
    if(!validar.mail(this.email)) return false;  //validamos el email



  // como todo esta en orden, entonces retornamos positivo, para que guarde el documento
   
   return true;   

 
}, 'parametros invalidos'); 



// ==========================================================



module.exports = mongoose.model('usuarios', usuarioSchema);
