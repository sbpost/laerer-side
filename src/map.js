// INITIALIZE MAP (BACKGROUND) --------------------------------------

let mapboxAccessToken =
  "pk.eyJ1IjoiYmFsY2hlbnBvc3QiLCJhIjoiY2tqaWJ1bXRsMmd4MjMxc2NobWd3Nnk2dyJ9.1IiEC7KCRVz1sQsnA562Yw";

let map = L.map("kommune-map").setView([56.26, 9.5], 7);
let geojson;
let active_layer;

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" +
    mapboxAccessToken,
  {
    id: "mapbox/light-v9",
    attribution: "",
    tileSize: 512,
    zoomOffset: -1,
  }
).addTo(map);

// Initiate the shaded (striped) pattern to fill selected features
let stripes = new L.StripePattern({
  angle: 45,
  color: "#83e3bd",
  weight: 3,
  spaceWeight: 0.5,
});

stripes.addTo(map);

function style(feature) {
  return {
    color: "#83e3bd",
    weight: 2,
    opacity: 1,
    dashArray: "0",
    fillOpacity: 0,
  };
}

// Initialize information box
let info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that updates the control based on feature properties passed
info.update = function (props) {
  //    this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
  //        '<b>' + props.LAU_NAME + '</b><br />' + ' people / mi<sup>2</sup>'
  //       : 'Hover over a state'j;
  this._div.innerHTML =
    "<h4>" +
    (active_layer
      ? "Du har valgt <b>" + props.LAU_NAME + "</b> kommune"
      : "Klik på en kommune") +
    "</h4>";
};

info.addTo(map);

// POPULATE MAP --------------------------------------------
// Remove all shapes that are not in the list of kommuner in
// activity data. Add the features to the map.
function populateMap(data) {
  let unique_kommune = [];
  data.forEach((d) => {
    if (!unique_kommune.includes(d.Kommune)) {
      unique_kommune.push(d.Kommune);
    }
  });

  // Populate map with kommune shapes
  $.getJSON("./data/kommune.json", function (data) {
    geojson = L.geoJson(data, {
      style: style,
      onEachFeature: onEachFeature,
      filter: kommuneFilter,
    }).addTo(map);

    function kommuneFilter(feature) {
      if (unique_kommune.includes(feature.properties.LAU_NAME)) return true;
    }
  });
}

// EVENT LISTENERS --------------------------------------------------

// Add event for clicks on a kommune.
function selectFeature(e) {
  // When first selecting a layer, remove the hidden attribute
  // of the chart areas.
  if (!active_layer) {
    $("#dendo-row").removeClass("hidden");
    $("#theme-filter-row").removeClass("hidden");
    $("#class-filter-row").removeClass("hidden");
    $("#schoollevel-filter-row").removeClass("hidden");
  }

  // For each click, unselect previous selection
  geojson.resetStyle();

  let layer = e.target;
  active_layer = e.target.feature.properties.LAU_NAME; // Grab name of chosen kommune

  // Change the style of the selected layer
  layer.setStyle({
    weight: 5,
    color: "#83e3bd",
    fillPattern: stripes,
    fillOpacity: 1,
  });

  // Update the information box
  info.update(layer.feature.properties);

  // And something for the less smart browsers.
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  // Filter data after clicking
  datasets.kommune_data = filterByKommune(datasets.activities);
  updateDendogramFigure(updateDendogramData());
}

// Do some highlighting when hovering over a layer
function hoverControl(e) {
  if (e.target.feature.properties.LAU_NAME != active_layer) {
    e.target.setStyle({
      weight: 1,
      color: "#83e3bd",
      fillPattern: stripes,
      fillOpacity: 0.5,
    });
  }

  e.target.bindTooltip(e.target.feature.properties.LAU_NAME).openTooltip();

  //    info.update(layer.feature.properties);
  //    layer.bindTooltip(layer.feature.properties.LAU_NAME);
}

// Remove the highlighting when not hovering over a layer, except if
// it is the active layer.
function hoverExitControl(e) {
  if (e.target.feature.properties.LAU_NAME != active_layer) {
    e.target.setStyle({
      weight: 1,
      color: "#83e3bd",
      fillPattern: null,
      fillOpacity: 0,
    });
  }
}

// Add listeners to each kommune layer
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: hoverControl,
    mouseout: hoverExitControl,
    //	click: zoomToFeature
    click: selectFeature,
  });
}
