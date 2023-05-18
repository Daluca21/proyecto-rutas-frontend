const express = require('express');
const axios = require('axios');
const router = express.Router();
const direccion = "http://localhost:8080/usuario";
const session = require('express-session');

router.post('/', (req, res) => {
  const userData = {
    correo:  req.session.correo,
    hashPassword: req.session.password,
  };
  console.log(direccion + "/get");
  axios.post(direccion + "/get", userData)
    .then(response => {
        if (response.data.success) {
            console.log(response.data);
            const user = response.data.data;
            res.redirec('perfil', {usuario: user});
        } else {
            res.render('login', { mensaje: 'Inicie Sesion' });
        }
    })
    .catch(error => {
        res.render('login', { mensaje: 'Inicie Sesion' });
    })
});

module.exports = router;