import Map from 'https://cdn.skypack.dev/ol/Map';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector';
import View from 'https://cdn.skypack.dev/ol/View';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import { fromLonLat } from 'https://cdn.skypack.dev/ol/proj';
import LineString from 'https://cdn.skypack.dev/ol/geom/LineString';
import Feature from 'https://cdn.skypack.dev/ol/Feature';

var barrios;
var rutas;
const osmLayer = new TileLayer({
	source: new OSM()
});

document.addEventListener('DOMContentLoaded', function() {
	fetch('../data/barrios.json')
	  .then(response => response.json())
	  .then(data => {
		barrios = data.elements;
	  })
	  .catch(error => {
		console.error('Error al cargar el archivo JSON:', error);
	  });

      const url = 'http://localhost:8080/ruta/all';
      fetch(url, {
        method: 'POST'
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Error en la solicitud');
          }
        return response.json();
      })
      .then(rutasData => {
        rutas = rutasData;
        // Cargar los mapas visibles en la ventana actual
        cargarMapasVisibles();
        // Agregar un controlador de eventos para cargar los mapas adicionales al desplazarse
        window.addEventListener('scroll', cargarMapasVisibles);
      })
      .catch(error => {
          console.error('Error:', error);
      });
});

function cargarMapasVisibles() {
  // Obtener la posición de desplazamiento actual
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  // Obtener la altura de la ventana visible
  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

  // Recorrer las rutas y cargar los mapas para las rutas visibles en la ventana actual
  rutas.forEach(function(ruta) {
    const rutaElement = document.getElementById('ruta-' + ruta.id);
    if (rutaElement) {
      const rutaTop = rutaElement.offsetTop;
      const rutaHeight = rutaElement.offsetHeight;

      // Comprobar si la ruta está dentro de la ventana visible
      if (rutaTop >= scrollTop && rutaTop + rutaHeight <= scrollTop + windowHeight) {
        // Comprobar si el mapa ya está creado
        if (!rutaElement.dataset.mapaCreado) {
          // Crear el mapa y configurarlo
          const puntos = ruta.puntos;
          const map = new Map({
            target: 'map-' + ruta.id,
            layers: [osmLayer],
            view: new View({
              center: fromLonLat([puntos[0].longitud, puntos[0].latitud]),
              zoom: 16,
            })
          });

          // Crea un arreglo de coordenadas utilizando los puntos de la ruta
          const coordenadas = puntos.map(function(punto) {
            return fromLonLat([punto.longitud, punto.latitud]);
          });

          // Crea una nueva ruta utilizando las coordenadas
          const route = new Feature({
            geometry: new LineString(coordenadas),
          });

          // Crea una capa vectorial para la ruta y agrega la ruta a la capa
          const vectorLayer = new VectorLayer({
            source: new VectorSource({
              features: [route],
            }),
          });
          map.addLayer(vectorLayer);

          rutaElement.dataset.mapaCreado = true;
        }
      }
    }
  });
}
