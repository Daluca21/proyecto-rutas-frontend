const express = require('express');
const router = express.Router();
const session = require('express-session');

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

router.get('/perfil', verificarAutenticacion, (req, res) => {
    const user = req.session.user || null;
    res.render('perfil', {usuario: user});
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
      }
      res.redirect('/login');
    });
});

module.exports = router;