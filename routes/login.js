const express = require('express');
const axios = require('axios');
const router = express.Router();
const direccion = "http://localhost:8080/usuario";
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
            console.log(response.data.data);
            res.redirect('/perfil');
        } else {
            res.render('login', { mensaje: 'Credenciales inválidas' });
        }
    })
    .catch(error => {
      res.render('login', { mensaje: 'Hubo un error al iniciar sesión, verifique la informacion' });
    })
});

module.exports = router;