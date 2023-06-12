const express = require("express");
const axios = require("axios");
const router = express.Router();
const direccion = "https://apprutascucuta.azurewebsites.net/administrador"; //Url para realizar la consulta a la base de datos
const direccionRuta = "https://apprutascucuta.azurewebsites.net/ruta"; //Url para realizar la consulta a la base de datos
const session = require("express-session");

router.post("/", (req, res) => {
  const userData = {
    correo: req.body.correo,
    hashPassword: req.body.password,
  };
  console.log(direccion + "/get");
  axios
    .post(direccion + "/get", userData)
    .then((response) => {
      if (response.data.success) {
        // Las credenciales son válidas, iniciar sesión y redirigir al usuario a una página protegida
        console.log(response.data);
        req.session.loggedIn = true;
        req.session.correo = response.data.data.correo;
        req.session.id = response.data.data.id;
        req.session.user = response.data.data;
        req.session.admin = true; //Identifica si la sesion es de un admin
        req.session.sadmin = response.data.data.superadmin;
        console.log(response.data.data);
        if (req.session.sadmin) res.redirect("/sadmin"); //Redirige al Dashboard
        else res.redirect("/admin/dashboard");
      } else {
        res.render("login_admin", { mensaje: "Credenciales inválidas" });
      }
    })
    .catch((error) => {
      res.render("login_admin", {
        mensaje: "Hubo un error al iniciar sesión, verifique la informacion",
      });
    });
});

router.post("/add", (req, res) => {
  const rutaData = req.body;
  console.log(direccionRuta + "/add");
  console.log(rutaData);
  axios
    .post(direccionRuta + "/add/" + req.session.user.id, rutaData)
    .then((response) => {
      res.json({ message: "Ruta guardada exitosamente" });
    })
    .catch((error) => {
      res.json({
        message: "Hubo un error al guardar la ruta, verifique la información",
      });
    });
});

router.post("/habilitar", (req, res) => {
  const rutaData = req.body;
  console.log(direccionRuta + "/habilitar");
  console.log(rutaData);
  axios
    .post(direccionRuta + "/habilitar", rutaData)
    .then((response) => {
      res.json({ message: "Ruta actualizada exitosamente" });
    })
    .catch((error) => {
      res.json({
        message: "Hubo un error al guardar la ruta, verifique la información",
      });
    });
});

router.get("/update/:id", (req, res) => {
  const id = req.params.id;
  const rutaData = {
    id: id,
  };
  axios
    .post(direccionRuta + "/get", rutaData)
    .then((response) => {
      res.render("actualizar_ruta", { ruta: response.data.data });
    })
    .catch((error) => {
      res.redirect("dashboard");
    });
});

router.post("/update", (req, res) => {
  const rutaData = req.body;
  console.log(direccionRuta + "/update");
  console.log(rutaData);
  axios
    .post(direccionRuta + "/update", rutaData)
    .then((response) => {
      res.json({ message: "Ruta guardada exitosamente" });
    })
    .catch((error) => {
      res.json({
        message: "Hubo un error al guardar la ruta, verifique la información",
      });
    });
});

router.post("/delete", (req, res) => {
  const rutaData = req.body;
  console.log(direccionRuta + "/delete");
  axios
    .post(direccionRuta + "/delete", rutaData)
    .then((response) => {
      res.json({ message: "Ruta guardada exitosamente" });
    })
    .catch((error) => {
      res.json({
        message: "Hubo un error al guardar la ruta, verifique la información",
      });
    });
});

module.exports = router;
