const express = require('express');
const axios = require('axios');
const router = express.Router();
const direccion = "http://localhost:8080/administrador"; //Url para realizar la consulta a la base de datos
const direccionRuta = "http://localhost:8080/ruta"; //Url para realizar la consulta a la base de datos
const session = require('express-session');

router.post('/', (req, res) => {
  const userData = {
    correo: req.body.correo,
    hashPassword: req.body.password,
  };
  console.log(direccion + "/get");
  axios.post(direccion + "/get", userData)
    .then(response => {
        if (response.data.success) {
            // Las credenciales son válidas, iniciar sesión y redirigir al usuario a una página protegida
            console.log(response.data);
            req.session.loggedIn = true;
            req.session.correo = response.data.data.correo;
            req.session.id = response.data.data.id;
            req.session.user = response.data.data;
            req.session.admin = true; //Identifica si la sesion es de un admin
            console.log(response.data.data);
            res.redirect('/admin/dashboard'); //Redirige al Dashboard
        } else {
            res.render('login_admin', { mensaje: 'Credenciales inválidas' });
        }
    })
    .catch(error => {
      res.render('login_admin', { mensaje: 'Hubo un error al iniciar sesión, verifique la informacion' });
    })
});

router.post('/add', (req, res) => {
  const rutaData = req.body;
  console.log(direccionRuta + "/add");
  console.log(rutaData);
  axios.post(direccionRuta + "/add", rutaData)
    .then(response => {
        if (response.data != 'Saved') {
          
        }
        console.log(response.data);
        //res.render('agregar_ruta', { mensaje: 'Hubo un error al guardar la ruta, verifique la informacion' });  
        res.render('agregar_ruta', { mensaje: 'Ruta guardada exitosamente' });
    })
    .catch(error => {
      res.render('agregar_ruta', { mensaje: 'Hubo un error al guardar la ruta, verifique la informacion' });
    })
});

module.exports = router;