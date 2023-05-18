const express = require('express');
const axios = require('axios');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const direccion = "http://localhost:8080/usuario";

router.post('/', [
  body('password', 'La contraseña es requerida').notEmpty(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('La confirmación de contraseña no coincide con la contraseña');
    }
    return true;
  }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('registro', { mensaje: 'La confirmación de contraseña no coincide con la contraseña' })
  }
  const userData = {
    correo: req.body.correo,
    hashPassword: req.body.password,
    nombre: req.body.nombre,
    apellido: req.body.apellido
  };
  console.log(direccion + "/add");
  axios.post(direccion + "/add", userData)
    .then(response => {
      res.redirect('/registro?mensaje=El+usuario+se+ha+guardado+correctamente');
    })
    .catch(error => {
      res.render('registro', { mensaje: 'Hubo un error al guardar, verifique la informacion' });
    })
});

module.exports = router;