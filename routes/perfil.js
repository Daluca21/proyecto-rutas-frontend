const express = require("express");
const axios = require("axios");
const router = express.Router();
const direccion = "https://apprutascucuta.azurewebsites.net/usuario";
const session = require("express-session");
const { body, validationResult } = require("express-validator");

router.post("/", (req, res) => {
  const userData = {
    correo: req.session.correo,
    hashPassword: req.session.password,
  };
  console.log(direccion + "/get");
  axios
    .post(direccion + "/get", userData)
    .then((response) => {
      if (response.data.success) {
        console.log(response.data);
        const user = response.data.data;
        res.render("perfil", { usuario: user, mensaje: null });
      } else {
        res.render("login", { mensaje: "Inicie Sesion" });
      }
    })
    .catch((error) => {
      res.render("login", { mensaje: "Inicie Sesion" });
    });
});

router.post(
  "/cambiarContrasena",
  [
    body("newPassword", "La contraseña es requerida").notEmpty(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error(
          "La confirmación de contraseña no coincide con la contraseña"
        );
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect("/perfil?mensaje=Algo+fallo");
    }
    var userData = req.session.user;
    console.log("HOLY 1");
    console.log(userData);
    axios
      .post(direccion + "/get", userData)
      .then((response) => {
        console.log("HOLY 2");
        console.log(response.data);
        if (response.data.success) {
          console.log("HOLY 3");
          userData = response.data.data;
          userData.hashPassword = req.body.newPassword;
          axios
            .post(direccion + "/update", userData)
            .then((response) => {
              req.session.user = userData;
              res.redirect("/perfil?mensaje=Se+actualizo+correctamente");
            })
            .catch((error) => {
              res.redirect("/perfil?mensaje=Hubo+un+error+al+actualizar");
            });
        } else {
          res.redirect("/perfil?mensaje=Credenciales+invalidas");
        }
      })
      .catch((error) => {
        res.redirect("/perfil?mensaje=Hubo+un+error");
      });
  }
);

router.post("/update", (req, res) => {
  var userData = req.session.user;
  axios
    .post(direccion + "/get", userData)
    .then((response) => {
      if (response.data.success) {
        userData = response.data.data;
        userData.nombre = req.body.nombre;
        userData.apellido = req.body.apellido;
        axios
          .post(direccion + "/update", userData)
          .then((response) => {
            req.session.user = userData;
            res.redirect("/perfil?mensaje=Se+actualizo+correctamente");
          })
          .catch((error) => {
            res.redirect("/perfil?mensaje=Hubo+un+error+al+actualizar");
          });
      } else {
        res.redirect("/perfil?mensaje=Credenciales+invalidas");
      }
    })
    .catch((error) => {
      res.redirect("/perfil?mensaje=Hubo+un+error");
    });
});
module.exports = router;
