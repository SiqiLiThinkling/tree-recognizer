document.addEventListener("DOMContentLoaded", function() {
  // Initialize the map centered on a default location (e.g., New York City)
  var map = L.map('map').setView([40.7128, -74.0060], 13);

  // Add the OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  var marker; // To hold the user-selected location marker
  var currentTreeResults = []; // To store the current fetched tree data

  // Render results in the results div using the selected language
  function renderResults(language) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
    if (currentTreeResults.length === 0) {
      resultsDiv.textContent = "No trees found.";
      return;
    }
    currentTreeResults.forEach(function(tree) {
      // Adjust the attribute name as needed (e.g., assume "SPECIES" holds the tree's species)
      const species = tree.attributes.SPECIES || "Unknown Species";
      // Format species name (replace spaces with underscores) for the Wikipedia URL
      const speciesFormatted = species.replace(/\s/g, "_");
      const wikiUrl = `https://${language}.wikipedia.org/wiki/${speciesFormatted}`;
      const treeDiv = document.createElement("div");
      treeDiv.innerHTML = `<strong>${species}</strong>: <a href="${wikiUrl}" target="_blank">${wikiUrl}</a>`;
      resultsDiv.appendChild(treeDiv);
    });
  }

  // Listen for map click events to select a location
  map.on('click', function(e) {
    const latlng = e.latlng;
    // Place or move the marker at the clicked location
    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng).addTo(map);
    }

    // Define a radius (in meters) to search for nearby trees
    var radius = 500; // Adjust as needed

    // Construct the ArcGIS query URL using the clicked point and radius.
    // (Check your dataset's query endpoint and attribute names; this is an illustrative example.)
    const queryUrl = `https://gisdata-csj.opendata.arcgis.com/datasets/7db16e012fe8402db45074cd260c8f4e_510/FeatureServer/0/query?where=1%3D1&geometry=${latlng.lng},${latlng.lat}&geometryType=esriGeometryPoint&distance=${radius}&units=esriSRUnit_Meter&inSR=4326&outFields=*&returnGeometry=true&f=json`;

    // Fetch the tree data from the ArcGIS dataset
    fetch(queryUrl)
      .then(response => response.json())
      .then(data => {
        if (data.features) {
          currentTreeResults = data.features;
          const language = document.getElementById("languageSelect").value;
          renderResults(language);
        } else {
          document.getElementById("results").textContent = "No trees found.";
        }
      })
      .catch(err => {
        console.error("Error fetching tree data:", err);
        document.getElementById("results").textContent = "Error fetching tree data.";
      });
  });

  // Update the Wikipedia links if the user selects a different language
  document.getElementById("languageSelect").addEventListener("change", function(e) {
    const language = e.target.value;
    renderResults(language);
  });
});