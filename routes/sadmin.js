const express = require("express");
const axios = require("axios");
const router = express.Router();
const direccion = "https://apprutascucuta.azurewebsites.net/administrador"; //Url para realizar la consulta a la base de datos
const { body, validationResult } = require("express-validator");

const isSuperAdmin = (req, res, next) => {
  // Ejemplo de validación básica: Verificar si el usuario tiene un rol de administrador
  const isSuperAdmin = req.session.loggedIn && req.session.sadmin;
  if (isSuperAdmin) {
    next();
  } else {
    // Si el usuario no es administrador, redirecciona a una página de error o muestra un mensaje de acceso denegado
    res.redirect("../admin");
  }
};

router.get("/", isSuperAdmin, (req, res) => {
  res.render("dashboard_sadmin");
});

router.get("/administrador", isSuperAdmin, (req, res) => {
  const direccionAdministradores =
    "https://apprutascucuta.azurewebsites.net/administrador/all";
  console.log(direccionAdministradores);
  axios
    .get(direccionAdministradores) //Ajustar para obtener por empresa
    .then((response) => {
      const success = req.query.success;
      res.render("administradores", {
        administradores: response.data,
        success: success,
      });
    })
    .catch((error) => {
      res.render("administradores", { administradores: null, success: null });
    });
});

router.post("/administrador/delete", isSuperAdmin, (req, res) => {
  const adminData = req.body;
  console.log(adminData);
  console.log(direccion + "/delete");
  axios
    .post(direccion + "/delete", adminData)
    .then((response) => {
      if (response.data == "Deleted") {
        res.redirect("/sadmin/administrador?mensaje=Eliminado"); //Redirige al Dashboard
      } else {
        return res.render("actualizar_administrador", {
          administrador: req.body,
          mensaje: "Error al eliminar",
        });
      }
    })
    .catch((error) => {
      return res.render("actualizar_administrador", {
        administrador: req.body,
        mensaje: "Error al eliminar",
      });
    });
});

router.get("/empresa", isSuperAdmin, (req, res) => {
  const direccionEmpresa =
    "https://apprutascucuta.azurewebsites.net/empresa/all";
  console.log(direccionEmpresa);
  axios
    .get(direccionEmpresa) //Ajustar para obtener por empresa
    .then((response) => {
      const success = req.query.success;
      res.render("empresas", { empresas: response.data, success: success });
    })
    .catch((error) => {
      res.render("empresas", { empresas: null, success: null });
    });
});

router.post("/empresa/delete", isSuperAdmin, (req, res) => {
  const direccionEmpresa = "https://apprutascucuta.azurewebsites.net/empresa";
  const empresaData = req.body;
  console.log(direccionEmpresa + "/delete", empresaData);
  axios
    .post(direccionEmpresa + "/delete", empresaData)
    .then((response) => {
      if (response.data == "Deleted") {
        res.redirect("/sadmin/empresa?success=true"); //Redirige al Dashboard
      } else {
        res.redirect("/sadmin/empresa?success=false"); //Redirige al Dashboard
      }
    })
    .catch((error) => {
      res.redirect("/sadmin/empresa?success=false"); //Redirige al Dashboard
    });
});

router.get("/administrador/update/:id", isSuperAdmin, (req, res) => {
  const direccionAdministrador =
    "https://apprutascucuta.azurewebsites.net/administrador";
  const id = req.params.id;
  const adminData = {
    id: id,
  };
  axios
    .post(direccionAdministrador + "/get", adminData)
    .then((response) => {
      res.render("actualizar_administrador", {
        administrador: response.data.data,
        mensaje: null,
      });
    })
    .catch((error) => {
      res.redirect("/sadmin/administrador");
    });
});

router.get("/administrador/add", isSuperAdmin, (req, res) => {
  res.render("agregar_administrador", { success: null });
});

router.post(
  "/administrador/update/:id",
  [
    body("hashPassword", "La contraseña es requerida").notEmpty(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.hashPassword) {
        throw new Error(
          "La confirmación de contraseña no coincide con la contraseña"
        );
      }
      return true;
    }),
    isSuperAdmin,
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("actualizar_administrador", {
        administrador: req.body,
        mensaje: "La confirmación de contraseña no coincide con la contraseña",
      });
    }
    const direccionAdministrador =
      "https://apprutascucuta.azurewebsites.net/administrador";
    const adminData = req.body;
    axios
      .post(direccionAdministrador + "/update", adminData)
      .then((response) => {
        res.render("actualizar_administrador", {
          administrador: req.body,
          mensaje: "Actualizado correctamente",
        });
      })
      .catch((error) => {
        res.render("actualizar_administrador", {
          administrador: req.body,
          mensaje: "Hubo un error verifique la informacion",
        });
      });
  }
);

router.post(
  "/administrador/add",
  [
    body("hashPassword", "La contraseña es requerida").notEmpty(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.hashPassword) {
        throw new Error(
          "La confirmación de contraseña no coincide con la contraseña"
        );
      }
      return true;
    }),
    isSuperAdmin,
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("agregar_administrador", {
        mensaje: "La confirmación de contraseña no coincide con la contraseña",
      });
    }
    const direccionAdministrador =
      "https://apprutascucuta.azurewebsites.net/administrador";
    const adminData = req.body;
    axios
      .post(direccionAdministrador + "/add", adminData)
      .then((response) => {
        res.render("agregar_administrador", {
          mensaje: "Actualizado correctamente",
        });
      })
      .catch((error) => {
        res.render("agregar_administrador", {
          mensaje: "Hubo un error verifique la informacion",
        });
      });
  }
);

router.post("/empresa/update/:id", isSuperAdmin, (req, res) => {
  const direccionEmpresa = "https://apprutascucuta.azurewebsites.net/empresa";
  const empresaData = req.body;
  axios
    .post(direccionEmpresa + "/update", empresaData)
    .then((response) => {
      res.redirect("/sadmin/empresa?success=true");
    })
    .catch((error) => {
      res.redirect("/sadmin/empresa?success=false");
    });
});

router.post("/empresa/add", isSuperAdmin, (req, res) => {
  const direccionEmpresa = "https://apprutascucuta.azurewebsites.net/empresa";
  const empresaData = req.body;
  axios
    .post(direccionEmpresa + "/add", empresaData)
    .then((response) => {
      res.redirect("/sadmin/empresa?success=true");
    })
    .catch((error) => {
      res.redirect("/sadmin/empresa?success=false");
    });
});
module.exports = router;
