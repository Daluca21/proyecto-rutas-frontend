const express = require('express');
const axios = require('axios');
const router = express.Router();
const direccion = "http://localhost:8080/administrador"; //Url para realizar la consulta a la base de datos
const direccionRuta = "http://localhost:8080/ruta"; //Url para realizar la consulta a la base de datos
const session = require('express-session');

const isSuperAdmin = (req, res, next) => {
    // Ejemplo de validación básica: Verificar si el usuario tiene un rol de administrador
    const isSuperAdmin = req.session.loggedIn && req.session.sadmin;
    if (isSuperAdmin) {
      next();
    } else {
      // Si el usuario no es administrador, redirecciona a una página de error o muestra un mensaje de acceso denegado
      res.redirect('../admin');
    }
  };

router.get('/', isSuperAdmin, (req, res) => {
    res.render('dashboard_sadmin');
});

router.get('/administradores', isSuperAdmin, (req, res) => {
  const direccionAdministradores = "http://localhost:8080/administrador/all";
  console.log(direccionAdministradores);
  axios.get(direccionAdministradores) //Ajustar para obtener por empresa
  .then(response => {
      const success = req.query.success;
      res.render('administradores', { administradores: response.data, success: success });
  })
  .catch(error => {
      res.render('administradores', { administradores: null, success: null });
  })
});

router.post('/administradores/delete/:id', isSuperAdmin, (req, res) => {
  const direccionAdministradores = "http://localhost:8080/administrador";
  const userData = {
    id: req.params.id,
  };
  console.log(direccion + "/delete");
  axios.post(direccion + "/delete", userData)
    .then(response => {
        if (response.data == 'Deleted') {
          res.redirect('/administradores?success=true'); //Redirige al Dashboard
        } else {
          res.redirect('/administradores?success=false'); //Redirige al Dashboard
        }
    })
    .catch(error => {
      res.redirect('/administradores?success=false'); //Redirige al Dashboard
    })
})

router.get('/empresas', isSuperAdmin, (req, res) => {
  const direccionEmpresa = "http://localhost:8080/empresa/all";
  console.log(direccionEmpresa);
  axios.get(direccionEmpresa) //Ajustar para obtener por empresa
  .then(response => {
      const success = req.query.success;
      res.render('empresas', { empresas: response.data, success: success});
  })
  .catch(error => {
    res.render('empresas', { empresas: null, success: null });
  })
});

router.post('/empresa/delete/:id', isSuperAdmin, (req, res) => {
  const direccionEmpresas = "http://localhost:8080/empresa";
  const userData = {
    id: req.params.id,
  };
  console.log(direccion + "/delete");
  axios.post(direccion + "/delete", userData)
    .then(response => {
        if (response.data == 'Deleted') {
          res.redirect('/empresas?success=true'); //Redirige al Dashboard
        } else {
          res.redirect('/empresas?success=false'); //Redirige al Dashboard
        }
    })
    .catch(error => {
      res.redirect('/empresas?success=false'); //Redirige al Dashboard
    })
})



module.exports = router;