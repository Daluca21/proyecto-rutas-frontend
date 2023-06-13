const express = require("express");
const axios = require("axios");
const router = express.Router();
const direccionRuta = "https://apprutascucuta.azurewebsites.net/ruta"; //Url para realizar la consulta a la base de datos
const session = require("express-session");

router.post("/all", (req, res) => {
  axios
  .post(direccionRuta + "/all")
  .then((response) => {
    res.json(response.data);
  })
  .catch((error) => {
    res.json({
      message: "Hubo un error al guardar la ruta, verifique la información",
    });
  });
});

module.exports = router;
