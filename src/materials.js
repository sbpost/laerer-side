// TODO: Refactor code. Make easier to navigate.
function updateMaterialData() {
  material_data = applyFilters(datasets.materials);
  return material_data;
}

let mat_opts = {
  space_between_squares: 10,
  space_between_lines: 30,
  rect_height: 50,
  text_margin_left: 10,
  text_margin_right: 10,
  char_width: 12,
  enter_x: -200,
  exit_x: 1800,
};

let mat_width = 1200;
let mat_height = 1200;

let materials_svg = d3
  .select("#materials")
  .append("svg")
  .attr("width", mat_width)
  .attr("height", mat_height);

function updateMaterials(material_data) {
  const t = materials_svg.transition().duration(1000);

  let box_tracker = {
    current_line: 0,
    line_width: 1200,
    currently_used: 0,
    on_line: 0,
  };

  // add variables to each observation with placement
  material_data.forEach((d) => {
    // CALCULATE X placement:
    // First, calculate box width
    d.box_width = d.Titel.length * mat_opts.char_width;
    // Second, see if there is room on current line
    // if not:
    if (d.box_width > box_tracker.line_width - box_tracker.currently_used) {
      // ... move to a new line
      box_tracker.current_line = box_tracker.current_line + 1;
      // reset currently used
      d.x = mat_opts.space_between_squares;
      box_tracker.currently_used = 0;
    } else {
      // if there is room, increase the amount of line used
      d.x = box_tracker.currently_used + mat_opts.space_between_squares;
    }
    box_tracker.currently_used =
      box_tracker.currently_used + d.box_width + mat_opts.space_between_squares;
    // CALCULATE Y placement
    d.y =
      box_tracker.current_line *
      (mat_opts.rect_height + mat_opts.space_between_lines);
  });

  materials_svg
    .selectAll("rect")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("rect")
          .on("mouseover", mouseOverHandlerMat)
          .on("mouseout", mouseOutHandlerMat)
          .on("click", clickHandlerMat)
          .attr("fill", "blue")
          .attr("stroke", "black")
          .attr("opacity", 0.2)
          .attr("x", mat_opts.enter_x)
          .attr("y", (d) => d.y)
          .attr("width", (d) => d.box_width)
          .attr("height", mat_opts.rect_height)
          .call((enter) => enter.transition(t).attr("x", (d) => d.x)),
      (update) =>
        update.attr("fill", "black").call((update) =>
          update
            .transition(t)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
        ),
      (exit) =>
        exit
          .attr("fill", "brown")
          .call((exit) =>
            exit.transition(t).attr("x", mat_opts.exit_x).remove()
          )
    );

  materials_svg
    .selectAll("text")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("fill", "green")
          .attr("x", mat_opts.enter_x)
          .attr("y", (d, i) => {
            return d.y + 20;
            //             i * (mat_opts.rect_height + mat_opts.space_between_lines) + 20
            //           );
          })
          .text((d) => createText(d))
          .attr("class", "materials-label")
          .attr("class", "textlabel")
          .call((enter) =>
            enter
              .transition(t)
              // .attr("x", (d, i) => 10 + mat_opts.text_margin_left)
              .attr("x", (d) => d.x + mat_opts.text_margin_left)
          ),
      (update) =>
        update.attr("fill", "black").call((update) =>
          update
            .transition(t)
            .attr("x", (d) => d.x + mat_opts.text_margin_left)
            // .attr("x", (d, i) => 10 + mat_opts.text_margin_left)
            .attr(
              "y",
              (d) => d.y + 20
              // (d, i) =>
              //               i * (mat_opts.rect_height + mat_opts.space_between_lines) + 20
            )
        ),
      (exit) =>
        exit
          .attr("fill", "brown")
          .call((exit) =>
            exit.transition(t).attr("x", mat_opts.exit_x).remove()
          )
    );

  // Create squares
  /**
  materials_svg
    .selectAll("rect")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("fill", "#b9eae6")
          .attr("width", function (d) {
            return d.Titel.length * 10 + mat_opts.text_margin_left * 2;
          })
          .attr("height", mat_opts.rect_height)
          .attr("y", function (d, i) {
            return (
              i * (mat_opts.rect_height + mat_opts.space_between_squares) +
              mat_opts.space_between_squares
            );
          })
          .attr("x", -200)
          .attr("stroke", "black")
          .call((enter) =>
            enter.transition(t).attr("x", function (d, i) {
              return mat_opts.rect_height;
            })
          ),
      (update) => update.attr("fill", "red")
    )
    .attr("class", "bar")
    .on("mouseover", mouseOverHandler)
    .on("mouseout", mouseOutHandler)
    .on("click", function (event, d) {
      if (d.Link) {
        window.open(d.Link);
      }
    }); **/
}

function mouseOverHandlerMat(event, d) {
  // If the node has a link, make slighter larger + change color
  // if the node does not have a link, make different color
  let g = d3.select(event.target.parentElement);
  let rect = d3.select(event.target);
  rect.classed("materials-highlighted", true);
  g.style("cursor", "pointer");
}

function mouseOutHandlerMat(event, d) {
  let rect = d3.select(event.target);
  rect.classed("materials-highlighted", false);
}

function clickHandlerMat(event, d) {
  if (d.Link) {
    window.open(d.Link);
  }
}

function createText(d) {
  // Get header:
  let header = d.Titel;

  // Get eubtitle:
  let active_themes = [];
  THEMES.forEach((theme) => {
    if (d[theme] == 1) {
      active_themes.push(theme);
    }
  });
  active_themes = active_themes.join(", ");

  let return_string = header;

  return return_string;
}

/**
  // Create text
  let materials_text = materials_svg
    .selectAll("text")
    .data(material_data)
    .enter()
    .append("text");

  materials_text
    .attr("x", function (d, i) {
      return mat_opts.rect_height + mat_opts.text_margin_left;
    })
    .attr("y", function (d, i) {
      return (
        i * (mat_opts.rect_height + mat_opts.space_between_squares) +
        mat_opts.space_between_squares +
        15
      );
    })
    //   .attr("font-weight", "bold")
    .attr("font-family", "Lucida Console")
    .attr("dy", ".31em")
    .attr("class", "textlabel")
    .text((d) => d.Titel);

  // TODO: update pattern
  console.log(datasets.materials);
}
**/

// Initiate canvas
// let width = 960
// let height = 950
