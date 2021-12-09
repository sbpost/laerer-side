// TODO: Make container-height variable depending on the number of
// materials.
// The number of materials can be overwhelming before filtering
// (because they are not filtered by region). It was requested that
// materials should not show up before filtering.


let filter_options = {
  class: [
    "0. klasse",
    "1. klasse",
    "2. klasse",
    "3. klasse",
    "4. klasse",
    "5. klasse",
    "6. klasse",
    "7. klasse",
    "8. klasse",
    "9. klasse",
    "10. klasse",
  ],
  classlabel: {
    "0. kl": "0. klasse",
    "1. kl": "1. klasse",
    "2. kl": "2. klasse",
    "3. kl": "3. klasse",
    "4. kl": "4. klasse",
    "5. kl": "5. klasse",
    "6. kl": "6. klasse",
    "7. kl": "7. klasse",
    "8. kl": "8. klasse",
    "9. kl": "9. klasse",
    "10. kl": "10. klasse",
  },
  theme: ["Energi", "Fødevarer", "Klima", "Natur", "Ressourcer", "Sundhed"],
  schoollevel: ["Indskoling", "Mellemtrin", "Udskoling"],
};

// Selection container for dendogram filters:
// Start with all themes and all classes selected.
let current_selection = {
  class: filter_options.class,
  theme: filter_options.theme,
  schoollevel: filter_options.schoollevel,
};


function handleFilterClick(event, d) {
  /** This function handles the filtering operation that happens when a user
  * clicks on one of the filters above the dendogram. The argument `d` is the
  * the text on the filter's 'button'.
  *
  * If all filters are selected (i.e. all observations are used) a click on a
  * 'filter button' will unselect all other filters except the one clicked on.
  * If all filters are not selected, clicking an unselected filter will add
  * this to the current filtering (filter-1 AND filter-2 AND ... etc).
  *
  * The special case of "Alle" will select all filters in the filtering category
  * (class, theme, schoollevel), no matter how many filters are selected.
  */

  // Get the filter category: either class, theme, or schoollevel.
  let filter_type = event.currentTarget.classList;
  filter_type.remove("selected-filter"); // `filter_type` is used to grab elements
  // in the D3 model.
  let filter_category = filter_type[0].replace("-filter", "");

  // Grab the clicked filter-name.
  // Classes use a shorter name on the filter so they need to filter by
  // the actual name used in the data instead of `d` (which is the
  // text on the filter).
  let selected_filter = filter_category == "class" ? filter_options.classlabel[d] : d;

  // If all filters are selected, select only filter just clicked:
  if (filter_options[filter_category] == current_selection[filter_category]) {

    current_selection[filter_category] = [selected_filter]

    d3.selectAll("." + filter_type[0]).classed("selected-filter", false); // Unselect all in category visually
    d3.select(event.currentTarget).classed("selected-filter", true); // Select target

    }
  // If the clicked-on filter is already selected, unselect it.
  else if (current_selection[filter_category].includes(selected_filter)) {

    current_selection[filter_category] = current_selection[filter_category].filter(e => { return e !== selected_filter })
    d3.select(event.currentTarget).classed("selected-filter", false); // Unselect target

  } // Finally, if the current filter is not selected, add it to current selection:
  else {
    current_selection[filter_category].push(selected_filter)
    d3.select(event.currentTarget).classed("selected-filter", true); // Select target

  }

  // In the special case of "alle"-filter buttons, make all filters in the current
  // type 'selected' no matter the status of the other filters.
  if (d == "Alle") {
    current_selection[filter_category] = filter_options[filter_category];
    d3.selectAll("." + filter_type[0]).classed("selected-filter", true); // Select all in category
  }

  // Filter data and update figure:
  updateDendogramFigure(updateDendogramData());
  // remove "hidden" for materials row:
  $("#material-row").removeClass("hidden");
  updateMaterials(updateMaterialData());

}

// Create clickable filters -----------------------------------------
let margin = { top: 5, right: 0, bottom: 5, left: 0 };

// Create arrays with the content of each filter
let class_filter_array = ["Alle", ...Object.keys(filter_options.classlabel)];
let schoollevel_filter_array = ["Alle", ...filter_options.schoollevel];
let theme_filter_array = ["Alle", ...filter_options.theme];

// Create filter for class:
// Instantiate object with options used in the filter figure
let class_filter_options = {
  circle_r: 25, // size of class filter buttons
  number_of_circles: class_filter_array.length,
  space_between_circles: 25,
  get space_taken_by_circles() {
    return (
      this.circle_r * 2 * this.number_of_circles +
      this.space_between_circles * this.number_of_circles -
      this.space_between_circles
    ); // last is for i = 0
  },
  get circle_margins() {
    return (this.circle_r * 2 * 3) / 2;
  },
  get filter_height() {
    return this.circle_r * 2 + margin.top + margin.bottom;
  },
  get filter_width() {
    return this.space_taken_by_circles + this.circle_margins * 2; // three circles margin on each side
  },
};

let class_svg = d3
  .select("#class-filter")
  .append("svg")
  .attr("width", class_filter_options.filter_width)
  .attr("height", class_filter_options.filter_height);

// Create and append the circles for the class filter:
let class_circles = class_svg
  .selectAll("g")
  .data(class_filter_array)
  .enter()
  .append("circle");

class_circles
  .attr("class", "class-filter")
  .attr("r", class_filter_options.circle_r)
  .attr("cx", function (d, i) {
    return (
      (class_filter_options.circle_r * 2 +
        class_filter_options.space_between_circles) *
        i +
      class_filter_options.circle_margins +
      class_filter_options.circle_r
    );
  })
  .attr("cy", function (d, i) {
    return class_filter_options.filter_height / 2;
  })
  .attr("fill", (d, i) => {
    return "#cae3d9";
  })
  .attr("fill-opacity", 0.2)
  .attr("stroke-width", 3)
  .attr("stroke", "#cae3d9")
  .classed("selected-filter", true)
  .on("click", handleFilterClick);

// Create and append the text-labels on top of the circles
let class_labels = class_svg
  .selectAll("text")
  .data(class_filter_array)
  .enter()
  .append("text");

class_labels
  .attr("x", function (d, i) {
    return (
      (class_filter_options.circle_r * 2 +
        class_filter_options.space_between_circles) *
        i +
      class_filter_options.circle_margins +
      class_filter_options.circle_r
    );
  })
  .attr("y", function (d, i) {
    return class_filter_options.filter_height / 2;
  })
  .attr("text-anchor", "middle")
  .attr("font-weight", "bold")
  .attr("dy", ".31em")
  .attr("class", "textlabel")
  .text((d) => d);

// Create theme filter:
// Instantiate object with options used in the filter figure
let theme_filter_options = {
  number_of_squares: theme_filter_array.length,
  rect_width: 100,
  rect_height: 50, // size of rectangles in theme and schoollevel filters
  get space_between_squares() {
    return this.rect_width / 2;
  },
  get square_margins() {
    return this.rect_width / 2;
  },
  get space_taken_by_squares() {
    return (
      this.rect_width * this.number_of_squares +
      this.space_between_squares * this.number_of_squares -
      this.space_between_squares
    );
  },
  get filter_height() {
    return this.rect_height + margin.top + margin.bottom;
  },
  get filter_width() {
    return this.space_taken_by_squares + this.square_margins * 2;
  },
};

// Create filter buttons:
let theme_svg = d3
  .select("#theme-filter")
  .append("svg")
  .attr("width", theme_filter_options.filter_width + margin.left + margin.right)
  .attr("height", theme_filter_options.filter_height);

// Create and append the rectangles for the tema filter
let theme_squares = theme_svg
  .selectAll("g")
  .data(theme_filter_array)
  .enter()
  .append("rect");

theme_squares
  .attr("class", "bar")
  .attr("class", "theme-filter")
  .attr("x", function (d, i) {
    return (
      (theme_filter_options.rect_width +
        theme_filter_options.space_between_squares) *
        i +
      theme_filter_options.square_margins
    );
  })
  .attr("width", theme_filter_options.rect_width)
  .attr("y", function (d, i) {
    return 0 + margin.top;
  })
  .attr("height", theme_filter_options.rect_height)
  .attr("fill", (d) => {
    return COLORS_DICT[d];
  })
  .attr("fill-opacity", 0.2)
  .attr("stroke-width", 2)
  .attr("stroke", (d) => {
    return COLORS_DICT[d];
  })
  .classed("selected-filter", true)
  .on("click", handleFilterClick);

// Create and append the text-labels on top of the squares
let theme_labels = theme_svg
  .selectAll("text")
  .data(theme_filter_array)
  .enter()
  .append("text");

theme_labels
  .attr("x", function (d, i) {
    return (
      (theme_filter_options.rect_width +
        theme_filter_options.space_between_squares) *
        i +
      theme_filter_options.square_margins +
      theme_filter_options.rect_width / 2
    );
  })
  .attr("y", function (d, i) {
    return 0 + margin.top + theme_filter_options.rect_height / 2;
  })
  .attr("text-anchor", "middle")
  .attr("font-weight", "bold")
  .attr("dy", ".31em")
  .attr("class", "textlabel")
  .text((d) => d);

// Create schoollevel filter:
// Instantiate object with options used in the filter figure
let schoollevel_filter_opts = {
  number_of_squares: schoollevel_filter_array.length,
  rect_width: 100,
  rect_height: 50,
  get space_between_squares() {
    return this.rect_width / 2;
  },
  get space_taken_by_squares() {
    return (
      this.rect_width * this.number_of_squares +
      this.space_between_squares * this.number_of_squares -
      this.space_between_squares
    );
  },
  get square_margins() {
    return this.rect_width / 2;
  },
  get filter_height() {
    return this.rect_height + margin.top + margin.bottom;
  },
  get filter_width() {
    return this.space_taken_by_squares + this.square_margins * 2;
  },
};

let schoollevel_svg = d3
  .select("#schoollevel-filter")
  .append("svg")
  .attr(
    "width",
    schoollevel_filter_opts.filter_width + margin.left + margin.right
  )
  .attr("height", schoollevel_filter_opts.filter_height);

// Create and append the rectangles for the tema filter
let schoollevel_squares = schoollevel_svg
  .selectAll("g")
  .data(schoollevel_filter_array)
  .enter()
  .append("rect");

schoollevel_squares
  .attr("class", "bar")
  .attr("class", "schoollevel-filter")
  // .attr("x", function(d, i) { return (rect_width * i + space_between_squares) + indent })
  .attr("x", function (d, i) {
    return (
      (schoollevel_filter_opts.rect_width +
        schoollevel_filter_opts.space_between_squares) *
        i +
      schoollevel_filter_opts.square_margins
    );
  })
  .attr("width", schoollevel_filter_opts.rect_width)
  .attr("y", function (d, i) {
    return 0 + margin.top;
  })
  .attr("height", schoollevel_filter_opts.rect_height)
  .attr("fill", (d) => {
    return "#74b2db";
  })
  .attr("fill-opacity", 0.2)
  .attr("stroke-width", 2)
  .attr("stroke", (d) => {
    return "#74b2db";
  })
  .classed("selected-filter", true)
  .on("click", handleFilterClick);

// Create and append the text-labels on top of the squares
let schoollevel_labels = schoollevel_svg
  .selectAll("text")
  .data(schoollevel_filter_array)
  .enter()
  .append("text");

schoollevel_labels
  .attr("x", function (d, i) {
    return (
      (schoollevel_filter_opts.rect_width +
        schoollevel_filter_opts.space_between_squares) *
        i +
      schoollevel_filter_opts.square_margins +
      schoollevel_filter_opts.rect_width / 2
    );
  })
  .attr("y", function (d, i) {
    return 0 + margin.top + schoollevel_filter_opts.rect_height / 2;
  })
  .attr("text-anchor", "middle")
  .attr("font-weight", "bold")
  .attr("dy", ".31em")
  .attr("class", "textlabel")
  .text((d) => d);
