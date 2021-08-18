// This file contains functions that handle data in a general sense.
// That is, functionality to grab data, clean data, and filter data.

// Grab data --------------------------------------------------------

// HANDLE GOOGLE SHEETS UPLOAD
// Very simple function that just grabs the google sheets data (+ sets a
// spinner that indicates that the data is being grabbed).

// TODO: Make it work with data that is not accessable just by the link
// TODO: Make the data checking workflow better: wrap all the "start up" mechanics in a function,
// which is then called by either getGoogleData or upload function
// TODO: Create some error message if getting it from sheets does not work
const getGoogleData = async () => {
  // $("#waiter").addClass("hidden");
  $("#map-spinner").removeClass("hidden");

  let activity_data = await d3
    .csv(
      // Published csv file w activities
      GOOGLE_DRIVE_LINK
    )
    .catch(function (error) {
      console.log(error);
    });

  activity_data.forEach((d) => fixData(d, "")); // fix klassetrin + tema

  let materials_data = await d3
    .csv(
      // Published csv file w materials
      MATERIALE_LINK
    )
    .catch(function (error) {
      console.log(error);
    });

  materials_data.forEach((d) => fixData(d, "")); // fix klassetrin + tema

  // Check if the user-supplied dataset contains the required variables
  // Go through each of the required columns and check if they are in the
  // dataset. REQUIRED_COLUMNS is defined in constants.js.
  let data_check = checkActivityData(activity_data, REQUIRED_ACTIVITY_COLUMNS);
  reportOnDataCheck(data_check);

  // Remove overlay
  $("#map-spinner").addClass("hidden");

  console.log(activity_data);
  console.log(materials_data);
  // Return both datasets as an object
  return {
    activities: activity_data,
    materials: materials_data,
  };
};

// Check data -------------------------------------------------------

// CHECK IF DATA IS USABLE
// This function checks if the data (either supplied by google drive or
// uploaded) fullfils the basic requirements.
function checkActivityData(data, columns) {
  // Alternatively, use subSet() if the specific columns are not required.
  let present_cols = new Set(data.columns);
  let missing_cols = []; // used for reporting which columns are bad

  columns.forEach((col) => {
    if (!present_cols.has(col)) {
      missing_cols.push(col);
    }
  });

  // Get all unique aktører and all unique aktiviteter and check if
  // intersection is > 0. If an activity has the same name as an aktør,
  // there is an issue with the dendogram because the parent/child
  // relationship becomes ambigious.
  let aktivitet_array = Array.from(data, (d) => d["Aktivitet"]);
  let aktor_array = Array.from(data, (d) => d["Aktør"]);
  let aktor_aktivitet_intersection = _.intersection(
    aktivitet_array,
    aktor_array
  );

  let data_check = {
    missing_columns: missing_cols,
    aktor_aktivitet_intersection: aktor_aktivitet_intersection,
  };

  return data_check;
}

// This function uses the output from the checkActivityData function to
// report on any issues with the data.
function reportOnDataCheck(data_check) {
  //
  // Otherwise populate map with data
  if (data_check.missing_columns.length > 0) {
    let message = `For at kortlægningen virker, kræver det at alle variabler er i datasættet. \n \nFølgende kolonner mangler i den fil der er uploaded: \n - ${data_check.missing_columns.join(
      "\n - "
    )} \n \n Upload venligst et komplet datasæt.`;
    alert(message);
  } else if (data_check.aktor_aktivitet_intersection.length > 0) {
    let message = `Der er aktiviteter i kortlægningen der har samme navn som en aktør. Det er ikke tilladt. Det drejer som om: \n - ${data_check.aktor_aktivitet_intersection.join(
      "\n - "
    )} \n \n Du kan enten rette navnet på aktøren eller aktiviteten, eller uploade et nyt datasæt.`;
    alert(message);
  } else {
  }
}

// Clean data -------------------------------------------------------

function fixData(d, not_offered) {
  // Fix classes
  d["0. klasse"] = d["0. klasse"] == not_offered ? 0 : 1;
  d["1. klasse"] = d["1. klasse"] == not_offered ? 0 : 1;
  d["2. klasse"] = d["2. klasse"] == not_offered ? 0 : 1;
  d["3. klasse"] = d["3. klasse"] == not_offered ? 0 : 1;
  d["4. klasse"] = d["4. klasse"] == not_offered ? 0 : 1;
  d["5. klasse"] = d["5. klasse"] == not_offered ? 0 : 1;
  d["6. klasse"] = d["6. klasse"] == not_offered ? 0 : 1;
  d["7. klasse"] = d["7. klasse"] == not_offered ? 0 : 1;
  d["8. klasse"] = d["8. klasse"] == not_offered ? 0 : 1;
  d["9. klasse"] = d["9. klasse"] == not_offered ? 0 : 1;
  d["10. klasse"] = d["10. klasse"] == not_offered ? 0 : 1;

  // Fix themes
  d["Klima"] = d["Klima"] == not_offered ? 0 : 1;
  d["Fødevarer"] = d["Fødevarer"] == not_offered ? 0 : 1;
  d["Natur"] = d["Natur"] == not_offered ? 0 : 1;
  d["Ressourcer"] = d["Ressourcer"] == not_offered ? 0 : 1;
  d["Energi"] = d["Energi"] == not_offered ? 0 : 1;
  d["Sundhed"] = d["Sundhed"] == not_offered ? 0 : 1;

  // Fix schoollevel
  d["Indskoling"] = d["Indskoling"] == not_offered ? 0 : 1;
  d["Mellemtrin"] = d["Mellemtrin"] == not_offered ? 0 : 1;
  d["Udskoling"] = d["Udskoling"] == not_offered ? 0 : 1;
  return d;
}

// Filter data ------------------------------------------------------

// After a user has clicked on a feature (kommune) on the map, the data
// supplied into the dendogram should be restricted to the given region.
function filterByKommune(unfiltered_data) {
  let filtered_data = unfiltered_data.filter((d) => {
    return d.Kommune == active_layer;
  });

  return filtered_data;
}

// There are also clickable filters that can be used to further restrict
// which activities and materials are shown. This function applies those
// filters.
function applyFilters(unfiltered_data) {
  let filtered_data = unfiltered_data.filter((d) => {
    let tema_score = 0;
    let klasse_score = 0;
    let skoletrin_score = 0;

    // if a theme/klasse/klassetrin is "active" in an activity/material,
    // value is 1. If at least one theme in the current selection is active,
    // keep observation.
    current_selection.theme.forEach((v) => {
      tema_score = tema_score + +d[v];
    });

    current_selection.class.forEach((v) => {
      klasse_score = klasse_score + +d[v];
    });

    current_selection.schoollevel.forEach((v) => {
      skoletrin_score = skoletrin_score + +d[v];
    });

    return (tema_score > 0) & (klasse_score > 0) & (skoletrin_score > 0)
      ? true
      : false;
  });

  return filtered_data;
}
