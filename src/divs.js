/**
var data = ["test1", "test2", "test3", "test4"];

var svgContainer = d3
  .select("#materials")
  .append("svg")
  .attr("width", 900)
  .attr("height", 400);

var header = svgContainer
  .selectAll("g")
  .data([data])
  .enter()
  .append("g")
  .attr("transform", "translate(0,0)");

header
  .append("rect")
  .attr("width", 120)
  .attr("height", 20)
  .attr("fill", "blue");

header
  .append("text")
  .attr("y", 15)
  .attr("x", 5)
  .text(function (d) {
    return "header";
  });

// create table body
var boxes = svgContainer
  .selectAll(".box")
  .data(data)
  .enter()
  .append("g")
  .attr("class", "box")
  .attr("transform", function (d, i) {
    return "translate(0," + (i + 1) * 20 + ")";
  });

boxes.append("rect").attr("width", 120).attr("height", 20).attr("fill", "red");

boxes
  .append("text")
  .attr("y", 15)
  .attr("x", 5)
  .text(function (d) {
    return d;
  });
**/
