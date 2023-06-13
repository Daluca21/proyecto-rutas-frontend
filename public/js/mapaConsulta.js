import Map from "https://cdn.skypack.dev/ol/Map";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector";
import View from "https://cdn.skypack.dev/ol/View";
import OSM from "https://cdn.skypack.dev/ol/source/OSM";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import { fromLonLat } from "https://cdn.skypack.dev/ol/proj";
import LineString from "https://cdn.skypack.dev/ol/geom/LineString";
import Feature from "https://cdn.skypack.dev/ol/Feature";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";

var barrios;
var rutas;
const osmLayer = new TileLayer({
  source: new OSM(),
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/barrios.json")
    .then((response) => response.json())
    .then((data) => {
      barrios = data.elements;
    })
    .catch((error) => {
      console.error("Error al cargar el archivo JSON:", error);
    });

  const url = "https://apprutascucutafrontend.azurewebsites.net/ruta/all";
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
      console.log(rutas);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

$(".map-btn").click(function (e) {
  e.preventDefault();
  if (!rutas) return;
  var rutaId = $(this).data("ruta-id");
  var ruta = rutas.find(function (ruta) {
    return ruta.id === rutaId;
  });
  console.log(ruta);
  if (ruta) {
    // Crea el contenido HTML del mapa
    var mapContainerId = "map-container-" + ruta.id;
    var $dynamicDiv = $("<div>")
      .addClass("map-container")
      .attr("id", mapContainerId);
    $.fancybox.open({
      src: $dynamicDiv,
      type: "inline",
      afterShow: function () {
        // Configura el mapa dentro del contenedor
        var puntos = ruta.puntos;
        var map = new Map({
          target: mapContainerId,
          layers: [osmLayer],
          view: new View({
            center: fromLonLat([puntos[0].longitud, puntos[0].latitud]),
            zoom: 16,
          }),
        });

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
        var vectorLayer = new VectorLayer({
          source: new VectorSource({
            features: [route],
          }),
        });
        map.addLayer(vectorLayer);
      },
      error: function (instance, current) {
        console.error("Error al cargar el contenido de FancyBox:", current);
      },
      afterClose: function () {
        // Elimina el mapa después de cerrar FancyBox
        $("#" + mapContainerId).remove();
      },
    });
  }
});
