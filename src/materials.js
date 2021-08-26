// TODO: Refactor code. Make easier to navigate.
// TODO: Skrive text/box om, så der laves en g som agerer lokalt koordinatsystem.
// Styr så data gennem g (rect + textstykker)
function updateMaterialData() {
  material_data = applyFilters(datasets.materials);
  return material_data;
}

let mat_opts = {
  space_between_squares: 10,
  space_between_lines: 30,
  rect_height: 110,
  text_margin_left: 10,
  text_margin_right: 10,
  char_width: 9,
  enter_x: -1000,
  exit_x: 1800,
};

let mat_width = 1200;
let mat_height = 3500;

let materials_svg = d3
  .select("#materials")
  .append("svg")
  .attr("width", mat_width)
  .attr("height", mat_height);

function updateMaterials(material_data) {
  const t = materials_svg.transition().duration(1000);

  let box_tracker = {
    current_line: 0,
    line_width: 1150,
    currently_used: 0,
    on_line: 0,
  };

  // add variables to each observation with placement
  material_data.forEach((d) => {
    // CALCULATE X placement:
    // First, calculate box width
    // The box width depends on the longest string. First, prepare text:
    let active_themes = [];
    THEMES.forEach((theme) => {
      if (d[theme] == 1) {
        active_themes.push(theme);
      }
    });

    d.theme_str = `Temaer: ${active_themes.join(", ")}`;
    d.keyword_str = `Nøgleord: ${d.Nøgleord}`;
    d.organizer_str = `Udbyder: ${d.Udbyder}`;

    active_themes = active_themes.join(", ");
    let longest_str = d3.max([
      d.Titel.length,
      d.theme_str.length,
      d.keyword_str.length,
      d.Udbyder.length,
    ]);

    d.box_width = longest_str * mat_opts.char_width;

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
        (mat_opts.rect_height + mat_opts.space_between_lines) +
      5;
  });

  materials_svg
    .selectAll("rect")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("rx", 8)
          .attr("ry", 8)
          .on("mouseover", mouseOverHandlerMat)
          .on("mouseout", mouseOutHandlerMat)
          .on("click", clickHandlerMat)
          .attr("fill", "white")
          .attr("stroke", "black")
          .attr("opacity", 0.5)
          .attr("x", mat_opts.enter_x)
          .attr("y", (d) => d.y)
          .attr("width", (d) => d.box_width)
          .attr("height", mat_opts.rect_height)
          .call((enter) => enter.transition(t).attr("x", (d) => d.x)),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("x", mat_opts.exit_x).remove()
        )
    );

  // Titles
  materials_svg
    .selectAll(".titles")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .attr("x", mat_opts.enter_x)
          .attr("y", (d, i) => {
            return d.y + 20;
          })
          .text((d) => createText(d))
          .attr("class", "textlabel")
          .attr("class", "titles")
          // .append("text")
          // .text((d) => createText(d))
          .call((enter) =>
            enter
              .transition(t)
              .attr("x", (d) => d.x + mat_opts.text_margin_left)
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("x", (d) => d.x + mat_opts.text_margin_left)
            .attr("y", (d) => d.y + 20)
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("x", mat_opts.exit_x).remove()
        )
    );

  materials_svg
    .selectAll(".udbyder")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("fill", "black")
          //         .attr("font-weight", "bold")
          .attr("x", mat_opts.enter_x)
          .attr("y", (d, i) => {
            return d.y + 40;
          })
          .text((d) => d.Udbyder)
          .attr("class", "textlabel")
          .attr("class", "udbyder")
          // .append("text")
          // .text((d) => createText(d))
          .call((enter) =>
            enter
              .transition(t)
              .attr("x", (d) => d.x + mat_opts.text_margin_left)
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("x", (d) => d.x + mat_opts.text_margin_left)
            .attr("y", (d) => d.y + 40)
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("x", mat_opts.exit_x).remove()
        )
    );

  materials_svg
    .selectAll(".kws")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("fill", "black")
          //         .attr("font-weight", "bold")
          .attr("x", mat_opts.enter_x)
          .attr("y", (d, i) => {
            return d.y + 80;
          })
          .text((d) => d.keyword_str)
          .attr("class", "textlabel")
          .attr("class", "kws")
          // .append("text")
          // .text((d) => createText(d))
          .call((enter) =>
            enter
              .transition(t)
              .attr("x", (d) => d.x + mat_opts.text_margin_left)
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("x", (d) => d.x + mat_opts.text_margin_left)
            .attr("y", (d) => d.y + 80)
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("x", mat_opts.exit_x).remove()
        )
    );

  materials_svg
    .selectAll(".themetext")
    .data(material_data, (d) => d.Titel)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("fill", "black")
          //         .attr("font-weight", "bold")
          .attr("x", mat_opts.enter_x)
          .attr("y", (d, i) => {
            return d.y + 100;
          })
          .text((d) => d.theme_str)
          .attr("class", "textlabel")
          .attr("class", "themetext")
          // .append("text")
          // .text((d) => createText(d))
          .call((enter) =>
            enter
              .transition(t)
              .attr("x", (d) => d.x + mat_opts.text_margin_left)
          ),
      (update) =>
        update.call((update) =>
          update
            .transition(t)
            .attr("x", (d) => d.x + mat_opts.text_margin_left)
            .attr("y", (d) => d.y + 100)
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition(t).attr("x", mat_opts.exit_x).remove()
        )
    );
}

function mouseOverHandlerMat(event, d) {
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
  let return_string = header;

  return return_string;
}
