import GeoJSON from "https://cdn.skypack.dev/ol/format/GeoJSON";
import Map from "https://cdn.skypack.dev/ol/Map";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector";
import View from "https://cdn.skypack.dev/ol/View";
//import Link from 'https://cdn.skypack.dev/ol/interaction/Link';
import Draw from "https://cdn.skypack.dev/ol/interaction/Draw";
import Snap from "https://cdn.skypack.dev/ol/interaction/Snap";
import OSM from "https://cdn.skypack.dev/ol/source/OSM";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import { fromLonLat } from "https://cdn.skypack.dev/ol/proj";
import { toLonLat } from "https://cdn.skypack.dev/ol/proj";
import { squaredDistance } from "https://cdn.skypack.dev/ol/coordinate";

var barrios;

document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/barrios.json")
    .then((response) => response.json())
    .then((data) => {
      barrios = data.elements;
    })
    .catch((error) => {
      console.error("Error al cargar el archivo JSON:", error);
    });
});

// Agrega la capa de OpenStreetMap
const osmLayer = new TileLayer({
  source: new OSM(),
});

var cityLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: "../data/cucuta.json",
  }),
});

//Creo una capa para el usuario dibuje
var drawLayer = new VectorLayer({
  source: new VectorSource({ wrapX: false }),
  projection: osmLayer.getSource().getProjection(),
});

//Inicializo el mapa, en layers agrego la capa osmLayer y drawLayer
const map = new Map({
  target: "map-container",
  layers: [osmLayer, drawLayer, cityLayer],
  view: new View({
    center: fromLonLat([-72.50782, 7.89391]),
    zoom: 15,
  }),
});

//Creo una interaccion Draw, la enlazo con la capa de dibujo y agrego el tipo de dibujo
var drawInteraction = new Draw({
  type: "LineString",
  source: drawLayer.getSource(),
  trace: true,
  traceSource: cityLayer.getSource(),
});

map.addInteraction(drawInteraction);

// Esto es para que el usuario no dibuje en zonas prohibidas
const snapInteraction = new Snap({
  source: cityLayer.getSource(),
});

map.addInteraction(drawInteraction);
map.addInteraction(snapInteraction);

//Limpio la capa de dibujo
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
      // Verificar si el nodo ya existe en la matriz
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
    const jsonData = JSON.stringify(formData);
    console.log(jsonData);
    const url = "/admin/add";
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
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
