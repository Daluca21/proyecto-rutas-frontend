import GeoJSON from "https://cdn.skypack.dev/ol/format/GeoJSON";
import Map from "https://cdn.skypack.dev/ol/Map";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector";
import View from "https://cdn.skypack.dev/ol/View";
//import Link from 'https://cdn.skypack.dev/ol/interaction/Link';
import Draw from "https://cdn.skypack.dev/ol/interaction/Draw";
import Snap from "https://cdn.skypack.dev/ol/interaction/Snap";
import Modify from "https://cdn.skypack.dev/ol/interaction/Modify";
import OSM from "https://cdn.skypack.dev/ol/source/OSM";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import { fromLonLat } from "https://cdn.skypack.dev/ol/proj";
import { toLonLat } from "https://cdn.skypack.dev/ol/proj";
import { squaredDistance } from "https://cdn.skypack.dev/ol/coordinate";
import LineString from "https://cdn.skypack.dev/ol/geom/LineString";
import Feature from "https://cdn.skypack.dev/ol/Feature";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";
var barrios;
var rutas;
var rutaId;
// Agrega la capa de OpenStreetMap
const osmLayer = new TileLayer({
  source: new OSM(),
});

var cityLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: "../../data/cucuta.json",
  }),
  visible: false,
});

//Creo una capa para el usuario dibuje
var drawLayer = new VectorLayer({
  source: new VectorSource({ wrapX: false }),
  projection: osmLayer.getSource().getProjection(),
});

const map = new Map({
  target: "map-container",
  layers: [osmLayer, drawLayer, cityLayer],
  view: new View({
    center: fromLonLat([-72.50782, 7.89391]),
    zoom: 15,
  }),
});

//Inicializo el mapa, en layers agrego la capa osmLayer y drawLayer

//Creo una interaccion Draw, la enlazo con la capa de dibujo y agrego el tipo de dibujo
var drawInteraction = new Draw({
  type: "LineString",
  source: drawLayer.getSource(),
  trace: true,
  traceSource: cityLayer.getSource(),
});

map.addInteraction(drawInteraction);

var modifyInteraction = new Modify({
  source: drawLayer.getSource(),
});

map.addInteraction(modifyInteraction);

// Esto es para que el usuario no dibuje en zonas prohibidas
const snapInteraction = new Snap({
  source: cityLayer.getSource(),
});

map.addInteraction(drawInteraction);
map.addInteraction(snapInteraction);

document.addEventListener("DOMContentLoaded", function () {
  fetch("../../data/barrios.json")
    .then((response) => response.json())
    .then((data) => {
      barrios = data.elements;
    })
    .catch((error) => {
      console.error("Error al cargar el archivo JSON:", error);
    });
  const url = "http://localhost:8080/ruta/all";
  fetch(url, {
    method: "POST",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }
      return response.json();
    })
    .then((rutasData) => {
      rutas = rutasData;
      if (!rutas) return;
      var url = window.location.href;
      var urlParts = url.split("/");
      rutaId = urlParts[urlParts.length - 1];
      rutaId = rutaId.replace("?", "");
      var ruta = rutas.find(function (ruta) {
        return ruta.id == rutaId;
      });
      // Configura el mapa dentro del contenedor
      var puntos = ruta.puntos;
      map.setView(
        new View({
          center: fromLonLat([puntos[0].longitud, puntos[0].latitud]),
          zoom: 16,
        })
      );

      // Crea un arreglo de coordenadas utilizando los puntos de la ruta
      var coordenadas = puntos.map(function (punto) {
        return fromLonLat([punto.longitud, punto.latitud]);
      });

      // Crea una nueva ruta utilizando las coordenadas
      var route = new Feature({
        geometry: new LineString(coordenadas),
      });

      var style = new Style({
        stroke: new Stroke({
          color: "red", // Cambia el color de la línea a rojo
          width: 3, // Cambia el ancho de la línea a 2 píxeles
        }),
      });
      route.setStyle(style);

      // Crea una capa vectorial para la ruta y agrega la ruta a la capa
      drawLayer.getSource().addFeature(route);
    })
    .catch((error) => {
      console.log(error);
      console.error("Error:", error);
    });
});

const clear = document.getElementById("clear");
clear.addEventListener("click", function () {
  drawLayer.getSource().clear();
});

const format = new GeoJSON({ featureProjection: "EPSG:3857" });

function obtenerLugarCercano(latitud, longitud) {
  let distancia = Infinity;
  let lugar = "?";
  for (let i = 0; i < barrios.length; i++) {
    if (barrios[i].tags) {
      const a = latitud - barrios[i].lat;
      const b = longitud - barrios[i].lon;
      const temp = squaredDistance([0, 0], [a, b]);
      if (temp < distancia) {
        lugar = barrios[i].tags.name;
        distancia = temp;
      }
    }
  }
  return lugar;
}

const form_add = document.querySelector("#form_add");
form_add.addEventListener("submit", function (event) {
  event.preventDefault();
  var points = drawLayer
    .getSource()
    .getFeatures()[0]
    .getGeometry()
    .getCoordinates();
  if (points.length > 1) {
    const formData = {};
    const nodos = [];
    let i = 1;
    for (var c in points) {
      let nodo = {};
      let lonLat = toLonLat(points[c]);
      nodo["longitud"] = lonLat[0];
      nodo["latitud"] = lonLat[1];
      nodo["prioridad"] = i++;
      console.log(nodo["latitud"] + " " + nodo["longitud"]);
      const nodoExistente = nodos.find(
        (n) => n.latitud === nodo.latitud && n.longitud === nodo.longitud
      );
      if (nodoExistente) {
        console.log("Punto duplicado. No se agrega a la matriz.");
        continue; // Saltar a la siguiente iteración del bucle
      }
      nodo["lugarCercano"] = obtenerLugarCercano(
        nodo["latitud"],
        nodo["longitud"]
      );
      nodos.push(nodo);
    }
    drawLayer.getSource().clear();
    // Recorre los campos del formulario
    formData["puntos"] = nodos;
    for (let i = 0; i < form_add.elements.length; i++) {
      const input = form_add.elements[i];
      if (input.name && input.value.trim() !== "") {
        formData[input.name] = input.value;
      }
    }
    formData.id = rutaId;
    const jsonData = JSON.stringify(formData);
    console.log(jsonData);
    const url = "/admin/update";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const alertContainer = document.querySelector("#alertContainer");
        const alertElement = document.createElement("div");
        alertElement.classList.add("alert", "alert-primary");
        alertElement.textContent = data.message;
        alertContainer.appendChild(alertElement);
        document.getElementById("form_add").reset();
        document.getElementById("alertContainer").hidden = false;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});

document
  .getElementById("deleteRouteButton")
  .addEventListener("click", function () {
    var formDelete = {
      id: rutaId,
    };
    const url = "/admin/delete";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formDelete),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data == "Deleted") {
          window.location.href = "/admin/dashboard";
        } else {
          const alertContainer = document.querySelector("#alertContainer");
          const alertElement = document.createElement("div");
          alertElement.classList.add("alert", "alert-primary");
          alertElement.textContent = "No se pudo eliminar";
          alertContainer.appendChild(alertElement);
          document.getElementById("form_add").reset();
          document.getElementById("alertContainer").hidden = false;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
