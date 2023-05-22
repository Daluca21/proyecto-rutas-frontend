const express = require('express');
const router = express.Router();
const session = require('express-session');
const axios = require('axios');

router.get('/contacto', (req,res)=>{
    res.render('contacto');
})

router.get('/registro', (req,res)=>{
    const mensaje = req.query.mensaje || null;
    res.render('registro', {mensaje});
})

router.get('/login', (req,res)=>{
    const mensaje = req.query.mensaje || null;
    res.render('login', {mensaje});
})

function verificarAutenticacion(req, res, next) {
    if (req.session.loggedIn) {
        // El usuario está autenticado, continuar con la solicitud
        next();
    } else {
        // El usuario no está autenticado, redirigir al formulario de inicio de sesión
        res.redirect('/login');
    }
}

const isAdmin = (req, res, next) => {
    // Ejemplo de validación básica: Verificar si el usuario tiene un rol de administrador
    const isAdminUser = req.session.loggedIn && req.session.admin;
    if (isAdminUser) {
      next();
    } else {
      // Si el usuario no es administrador, redirecciona a una página de error o muestra un mensaje de acceso denegado
      res.redirect('/admin');
    }
  };
  

router.get('/perfil', verificarAutenticacion, (req, res) => {
    const user = req.session.user || null;
    res.render('perfil', {usuario: user});
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
      }
      res.redirect('/login');
    });
});

router.get('/admin', (req,res)=>{
    const mensaje = req.query.mensaje || null;
    res.render('login_admin', {mensaje});
})

router.get('/admin/add', isAdmin, (req,res)=>{
    const mensaje = req.query.mensaje || null;
    res.render('agregar_ruta', {mensaje});
})

router.get('/admin/dashboard', isAdmin, (req, res) => {
    const direccionRuta = "http://localhost:8080/ruta";
    const rutaData = req.body;
    console.log(direccionRuta + "/all");
    console.log(rutaData);
    axios.get(direccionRuta + "/all") //Ajustar para obtener por empresa
      .then(response => {
          res.render('dashboard', { rutas: response.data });
      })
      .catch(error => {
        res.render('dashboard', { rutas: null });
      })
  });
  

module.exports = router;