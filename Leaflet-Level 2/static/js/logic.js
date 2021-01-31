// data url
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Create two layerGroups
var earthquakes = L.layerGroup();
var tectonicplates = L.layerGroup();

// create layers
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
});

var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

//create a baseMaps hold the base layers
var baseMaps = {
  "Satellite Map": satelliteMap,
  "Light Map": lightMap,
  "Outdoors Map": outdoorsMap,
  "Dark Map": darkMap
};

// Create overlay map to hold the overlay layer
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicplates
};

// Create the map
var myMap = L.map("mapid", {
  center: [
    36.876019, -115.224121
  ],
  zoom: 4,
  layers: [satelliteMap, earthquakes]
});

// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

d3.json(earthquakesURL, function(earthquakeData) {
  function markerSize(magnitude) {
    return magnitude * 4;
  };
  function chooseColor(depth) {
    switch(true) {
      case depth > 90:
        return "rgb(255,0,0)";
      case depth > 70:
        return "rgb(255, 165, 0)";
      case depth > 50:
        return "rgb(255, 215, 0)";
      case depth > 30:
        return "rgb(255,255,0)";
      case depth > 10:
        return "rgb(144, 238, 144)";
      default:
        return "rgb(173, 255, 47)";
    }
  }

  // Create a GeoJSON layer containing the features array
  L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, 

        {
          radius: markerSize(feature.properties.mag),
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          stroke: true,
          weight: 0.5
        }
      );
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
      + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  }).addTo(earthquakes);

  earthquakes.addTo(myMap);

  // Get the tectonic plate data from tectonicplatesURL
  d3.json(tectonicplatesURL, function(data) {
    L.geoJSON(data, {
      color: "orange",
      weight: 2
    }).addTo(tectonicplates);
    tectonicplates.addTo(myMap);
  });

    // Add legend
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend"),
      depth = [-10, 10, 30, 50, 70, 90];
      
      div.innerHTML += "<h3 style='text-align: center'></h3>"
  
      for (var i =0; i < depth.length; i++) {
        div.innerHTML += 
        '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
      };
      legend.addTo(myMap);
});
