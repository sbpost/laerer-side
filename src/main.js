// HANDLE DATA UPLOAD -----------------------------------------------

// TODO: Fix manual file upload. Use promises.
// https://stackoverflow.com/questions/11829537/html5-filereader-how-to-return-result


// Grab data
let datasets;

function getDataOnline() {
  getGoogleData().then((data) => {
    datasets = data;
    populateMap(datasets.activities);
  });
}

