// HANDLE DATA UPLOAD -----------------------------------------------
// let master_data; // To be able to access it outside of the reading function
// let kommune_data; // To be able to access it outside of the filtering function
// let materiale_data;

// Grab data
let datasets;
getGoogleData().then((data) => {
  datasets = data;
  console.log(datasets);
  populateMap(datasets.activities);
});

// populateMap(master_data);
// createMaterials();
