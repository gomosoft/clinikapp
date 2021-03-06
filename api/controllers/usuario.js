var usuarios = require('../models/usuarios');
var should = require('should');
var mongoose = require('mongoose');

    

var usuario = {

 
      crear : function(datos, callback){ 

            if(!datos.should.type('object')) return false;            
            if(!callback.should.be.type('function')) return false;

      	     
            datos = this.sanitizar(datos); 

           
         // ========== validamos si el usuario existe ====== //

            this.existe(datos, function(err, exist){  // ....... este método se encuentra al final

              console.log(exist)

              if(err) return callback(err, exist);
            
                
         // ==== verifiamos si no existe el usuario, sino existe, lo creamos ======= //

              if(!exist)
                new usuarios(datos).save( callback );
              else
                callback({ message : 'usuario_existe'}, null); 


            });

            

             return true;
            

       },

      eliminar : function(id, callback){  

            if(!id.should.type('string')) return false;            
            
            var sanitizar = require('../helpers/sanitizador');   
            id = sanitizar(id);   
          	usuarios.remove({_id:mongoose.Types.ObjectId(id)}, callback); 

            return true;      

      },

      actualizar : function(query, datos, callback){  

            if(!query.should.type('object')) return false;
            if(!datos.should.type('object')) return false;
            if(!callback.should.be.type('function')) return false;     

            datos = this.sanitizar(datos);                                                               
      
      	    usuarios.findOneAndUpdate(query, datos, callback); 

            return true;
            
      },

      buscar : function(opts, callback){  


            if(typeof opts === 'function')
               {var callback = opts; var opts = undefined; }

            if(!callback.should.be.type('function')) return false; 

            
            var sanitizar = require('../helpers/sanitizador');            


            var opts = opts || {};  //miramos por las opts

            var query = opts.query  || {};     // miramos si está definido un query

            var variables = opts.variables || {};  // miramos si se han especificado tomar unas variables especificas

             //sanitizamos las variables del query
             for(x in query)
                query[x] = this.sanitizar(query[x]);

           
      	    usuarios.find(
                          query, 
                          variables, 
                          { skip : parseInt(opts.skip) || 0 , limit : parseInt(opts.limit) || 0}, 
                          callback
                         ); 


            return true;
            

      },
      
      buscarUno : function(query, callback){
        
        if(!query.should.type('object')) return false;        
        if(!callback.should.be.type('function')) return false; 


        var sanitizar = require('../helpers/sanitizador');   
            id = sanitizar(id);         

        usuarios.findOne(query, callback);  // usamos mongoose.Types.ObjectId para compilar el id, evitando que nos coloquen otro tipo de variable

       
       return true;
         

      },

      // solo disponible para modo desarrollo 

      eliminarTodos : function(callback){

         usuarios.remove({}, callback);

         return true;

      },

      completarRegistro : function(datos, callback){


          if(typeof datos !== 'object') return false;
          if(typeof callback !== 'function') return false;

          
          this.crear(datos, function(err, rs){

             if(err)
              return callback(err,rs);
                            

             // _id_credencial debe ser pasado como parametro

             var uid = rs._id;
             var _id_credencial  = mongoose.Types.ObjectId(datos._id_credencial);
             var credencialCtrl = require('./credencial');

             credencialCtrl.actualizar({_id : _id_credencial},{_id_usuario : uid}, callback);

          });


      },

      sanitizar : function(datos){

              var sanitizar = require('../helpers/sanitizador');
                                  

             // ... recorremos el objeto this que contiene las variables a enviar. 
          
              for(x in datos) 
                datos[x] = sanitizar.hacer(datos[x]);  // sanitizamos los valores
        
        
              console.log(datos);  // valores sanitizados
              
              datos._tipo_doc = mongoose.Types.ObjectId(datos._tipo_doc);
        

              return datos;

     },

     existe : function(datos, callback){  // valida si un usuario existe. Retorna error en el primer parametro y un boolean que indica si existe en el segundo parametro

           var validar = require('../helpers/validador');           
           var numero_doc = datos.numero_doc;
           var tipo_doc = datos._tipo_doc;

           console.log(datos)


           if(!validar.cedula(numero_doc)) {             
             callback({ message : 'numero_doc_incorrecto'}, null);
             return false;
            };            

          // contamos los usuarios existentes con el mismo numero de documento

           usuarios.find({$or : [{email : datos.email},{_tipo_doc : mongoose.Types.ObjectId(tipo_doc)},{numero_doc : numero_doc }]})
            .count()
            .exec(function(err, count){

               console.log(count)

                callback(err, count > 0);  //si count es igual a cero devolvemos false (no existe)

           });

           return true;

     }

      
}


module.exports = usuario;