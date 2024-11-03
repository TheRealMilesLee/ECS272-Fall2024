import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { Graph2_data_cleaning } from './graphDataCleaning.js';

/** For this graph, we would like to create a line plot to show the relationship between the year and price of the cars.*/
export function Graph2_Detail()
{
  // Set up the margin for the chart
  const margin = { top: 25, right: 55, bottom: 25, left: 55 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom - 40;

  // Set up the SVG container
  const chartContainer_graph2 = d3.select("#Graph2")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${ margin.left }, ${ margin.top })`);

  // Clean the data and get the grouped data
  const recieved_clean_result = Graph2_data_cleaning();

  // Set up the x and y axis
  const x = d3.scaleBand()
    .domain(recieved_clean_result.map(d => d.year))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([d3.min(recieved_clean_result, d => d.price), d3.max(recieved_clean_result, d => d.price)])
    .range([height, 0]);

  // Create the x and y axis
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Append the x and y axis
  chartContainer_graph2.append("g")
    .attr("transform", `translate(0, ${ height })`)
    .call(xAxis);

  chartContainer_graph2.append("g")
    .call(yAxis);

  // Create the line generator
  const line = d3.line()
    .x(d => x(d.year) + x.bandwidth() / 2)
    .y(d => y(d.price));

  // Define the gradient
  const gradient = chartContainer_graph2.append("defs")
    .append("linearGradient")
    .attr("id", "line-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  // Define gradient stops based on year range
  const years = recieved_clean_result.map(d => d.year);
  const colors = d3.scaleLinear()
    .domain([0, years.length - 1])
    .range(["blue", "purple"]);

  years.forEach((year, index) =>
  {
    gradient.append("stop")
      .attr("offset", `${ (index / (years.length - 1)) * 100 }%`)
      .attr("stop-color", colors(index));
  });

  // Append the path for the line chart
  const path = chartContainer_graph2.append("path")
    .datum(recieved_clean_result)
    .attr("fill", "none")
    .attr("stroke-width", 5)
    .attr("d", line)
    .attr("stroke", "url(#line-gradient)")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-opacity", 0.8);

  // Animate the line chart
  const totalLength = path.node().getTotalLength();

  path.attr("stroke-dasharray", `${ totalLength } ${ totalLength }`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // Create the x-axis label
  chartContainer_graph2.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Year")
    .style("font-size", "12px");

  // Create the y-axis label
  chartContainer_graph2.append("text")
    .attr("x", -height / 2 + 10)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Price")
    .style("font-size", "12px");

  // Create the color legend next to the line chart
  const colorLegend = chartContainer_graph2.selectAll(".color-legend")
    .data(recieved_clean_result)
    .enter()
    .append("g")
    .attr("class", "color-legend")
    .attr("transform", (d, i) => `translate(${ width - 10 }, ${ i * 20 })`);

  colorLegend.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", d => colors(years.indexOf(d.year)));

  colorLegend.append("text")
    .attr("x", 15)
    .attr("y", 10)
    .style("font-size", "10px")
    .text(d => d.year);

}
