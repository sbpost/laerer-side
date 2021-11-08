// Define some color constants

function depth_scale(depth) {
  return depth == 2 ? 100 : 0;
}

function project(x, y, depth) {
  var angle = ((x - 90) / 180) * Math.PI,
      radius = y - depth_scale(depth);

  // var angle = (x - 90) / 180 * Math.PI, radius = y;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

// Initiate canvas
// let width = 960
// let height = 950
let width = 1200;
let height = 1200;
// let width = 1000;
// let height = 1000;
let radius = 390;
let radius_scaling = 1;
var svg = d3
    .select("#tree-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr(
      "transform",
      "translate(" + (width / 2 - 15) + "," + (height / 2 + 25) + ")"
    );

// Add logos
// TODO: Grab parent node position and substitute for the 0.
let center_logo_width = radius * 2 - 220;
let center_logo_height = radius * 2 - 220;
let centerlogo = svg
    .append("svg:image")
    .attr("x", 0 - center_logo_width / 2)
    .attr("y", 0 - center_logo_height / 2)
    .attr("width", center_logo_width)
    .attr("height", center_logo_height)
    .attr("xlink:href", "./imgs/DGR_logo_cirkel_negativ_cropped.png");

let cornerlogo = svg
    .append("svg:image")
    .attr("x", 400)
    .attr("y", 400)
    .attr("width", 2214 / 20)
    .attr("height", 1600 / 20)
    .attr("xlink:href", "./imgs/DGR_logo.png");

// Create the cluster layout:
let clusterMap = d3.cluster().size([360, radius]);

let stratify = d3
    .stratify()
    .id(function (d) {
      return d.name;
    })
    .parentId(function (d) {
      return d.parent;
    });

let linksGenerator = d3
    .linkRadial()
    .angle(function (d) {
      return (d.x / 180) * Math.PI;
    })
    .radius(function (d) {
      return d.y - depth_scale(d.depth);
    });

// Dum link (entry link, i.e. start of transition)
let dumLink = d3.linkRadial().angle(0).radius(0);

function updateDendogramData() {
  let node_data = [{ name: active_layer, parent: "" }];
  let parents = [];

  // Filter
  dendogram_data = applyFilters(datasets.kommune_data);

  dendogram_data.forEach((d) => {
    if (!parents.includes(d.Aktør)) {
      parents.push(d.Aktør);
      node_data.push({ name: d.Aktør, parent: active_layer });
    }

    node_data.push({ name: d.Aktivitet, parent: d.Aktør, link: d.Links });
  });

  // Create hierarchy used in dendogram
  let root = stratify(node_data);

  return root;
}

function updateDendogramFigure(data) {
  // Start clean when getting new data
  svg.selectAll("g").remove();
  svg.selectAll("path").remove();
  svg.selectAll("text").remove();

  let nodes = clusterMap(data);
  let u_links = svg.selectAll("path").data(nodes.links());
  let links_enter = u_links.enter().append("path");

  links_enter
    .attr("d", dumLink)
    .style("fill", "none")
    .attr("stroke", "#ccc")
    .style("opacity", 0.0)
    .merge(u_links);

  links_enter
    .transition()
    .ease(d3.easeLinear)
    .duration(500)
    .style("opacity", 1.0)
    .attr("d", linksGenerator);

  let u_node = svg.selectAll("g").data(nodes.descendants());

  let nodeEnter = u_node
      .enter()
      .append("g")
      .attr("class", function (d) {
        let assign_class =
            "node" + (d.children ? " node--internal" : " node--leaf");
        if (d.depth === 2) {
          assign_class =
            assign_class +
            (d.data.link === "" ? " node--unlinked" : " node--linked");
        }
        return assign_class;
      });

  // Attach a piece of text to each "g" (the container for each node)
  svg
    .selectAll("g")
    .append("text")
  //nodeEnter.append("text")
    .attr("dy", ".31em")
    .attr("x", function (d) {
      return d.x < 180 === !d.children ? 10 : -10;
    })
    .style("text-anchor", function (d) {
      return d.x < 180 === !d.children ? "start" : "end";
    })
    .style("font-family", "Nunito")
    .attr("transform", function (d) {
      return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
    })
  // .text(function(d) { return d.data.name == active_layer ? "" : d.data.name });
    .text(function (d) {
      return d.depth === 0 ? "" : d.data.name;
    })
    .on("mouseover", mouseOverHandler)
    .on("mouseout", mouseOutHandler)
    .on("click", function (event, d) {
      if (d.data.link) {
        window.open(d.data.link);
      }
    });

  // Enter the nodes in the middle.
  nodeEnter
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0.0)
    .append("circle")
    .attr("r", 6)
  //   .attr("fill", "#999")
    .on("mouseover", mouseOverHandler)
    .on("mouseout", mouseOutHandler)
    .on("click", function (event, d) {
      if (d.data.link) {
        window.open(d.data.link);
      }
    })
  // If all themes are chosen, make nodes gray. Otherwise, color by theme.
    .attr("fill", (d) => {
      return current_selection.theme.length == THEMES.length
        ? "#999"
        : COLORS_DICT[current_selection.theme];
    }) // TODO
    .merge(u_node);

  // Move them to their correct position
  nodeEnter
    .transition()
    .ease(d3.easeLinear)
    .duration(500)
    .style("opacity", 1.0)
    .attr("transform", function (d) {
      return "translate(" + project(d.x, d.y, d.depth) + ")";
    });

  // Add header over dendogram showing the active region
  svg
    .append("text")
    .attr("x", 0)
    .attr("y", -1 * (height / 2) + 80)
    .attr("text-anchor", "middle")
    .attr("dy", "0.31em")
    .attr("class", "h2")
    .style("font-family", "Nunito")
    .text(active_layer + " kommune"); // active_layer is the name of the selected region
  // If there is no observations, show some text
  // if (!data.children) {
  // svg
  //   .append("text")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .attr("text-anchor", "middle")
  //   .attr("dy", "0.31em")
  //   .attr("class", "h2")
  //   .style("font-family", "Nunito")
  //   .text("Der er ikke nogle aktiviteter i kommunen der matcher de valgte temaer og klassetrin."); // active_layer is the name of the selected region
  // }
}

// Define a handle for mouse hover events
function mouseOverHandler(event, d) {
  // If the node has a link, make slighter larger + change color
  // if the node does not have a link, make different color
  let g = d3.select(event.target.parentElement);
  g.classed("highlighted", true);
  // Only highlight nodes with/without link if it is a leaf node
  if (g.classed("node--leaf")) {
    if (g.classed("node--linked")) {
      g.classed("with-link", true);
      g.style("cursor", "pointer");
    } else {
      g.classed("without-link", true);
    }
  }
}

function mouseOutHandler(event, d) {
  let g = d3.select(event.target.parentElement);
  g.classed("highlighted", false);
}
