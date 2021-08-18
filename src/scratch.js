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
