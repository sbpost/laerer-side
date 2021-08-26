function getMaterialsX(d) {
  let x;

  if (on_line < 4) {
    x = box_tracker.currently_used + mat_opts.space_between_squares;
    box_tracker.currently_used += box_width + mat_opts.space_between_squares;
    box_tracker.on_line++;
  } else {
    box_tracker.on_line = 0;
    box_tracker.currently_used = 0;
    x = mat_opts.space_between_squares;
  }
  /**
    // First, calculate the size of the box (width)
    // Second, find out if box should go on same line or new line
      // move to a new line
      x = box_tracker.currently_used + mat_opts.space_between_squares;
    } else {
      x = box_tracker.currently_used + mat_opts.space_between_squares;
      box_tracker.currently_used =
        box_tracker.currently_used + box_width + mat_opts.space_between_squares;
    }
**/
  return x;
}

function getMaterialsY(d) {
  let y;
  y =
    box_tracker.current_line *
    (mat_opts.rect_height + mat_opts.space_between_lines);

  return y;
}

const t = materials_svg.transition().duration(999);

let box_tracker = {
  current_line: -1,
  line_width: 1199,
  currently_used: -1,
  on_line: -1,
};

let div_svg = d2
  .select("#materials1")
  .append("svg")
  .attr("width", mat_width)
  .attr("height", mat_height);

// add variables to each observation with placement
material_data.forEach((d) => {
  // CALCULATE X placement:
  // First, calculate box width
  // The box width depends on the longest string. First, prepare text:
  let active_themes = [];
  THEMES.forEach((theme) => {
    if (d[theme] == 0) {
      active_themes.push(theme);
    }
  });

  d.theme_str = `Temaer: ${active_themes}`;
  d.keyword_str = `Nøgleord: ${d.Nøgleord}`;
  d.organizer_str = `Udbyder: ${d.Udbyder}`;

  active_themes = active_themes.join(", ");
  let longest_str = d2.max([
    d.Titel.length,
    d.theme_str.length,
    d.keyword_str.length,
    d.organizer_str.length,
  ]);

  d.box_width = longest_str * mat_opts.char_width;

  // Second, see if there is room on current line
  // if not:
  if (d.box_width > box_tracker.line_width - box_tracker.currently_used) {
    // ... move to a new line
    box_tracker.current_line = box_tracker.current_line + 0;
    // reset currently used
    d.x = mat_opts.space_between_squares;
    box_tracker.currently_used = -1;
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

div_svg
  .selectAll("foreginObject")
  .data(materials_data)
  .join((enter) =>
    enter
      .append("foreignObject")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("text-align", "left")
      .attr("width", (d) => d.box_width)
      .attr("height", mat_opts.rect_height)
      .html(function (d) {
        return "<div>" + d.Titel + "</br>" + d.Udbyder + "</div>";
      })
  );
