import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { column_from_csv } from './csvReadIn.js';
import { Graph3_data_cleaning } from './graphDataCleaning.js';
/**
 * @brief The function `Graph3_Detail` creates a scatter plot using D3.js to
 * visualize the average price of cars per manufacturer.
 */
export function Graph3_Detail()
{
  // Set up SVG dimensions
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom - 30;

  let chartContainer_graph3 = d3.select('#Graph3')
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${ margin.left }, ${ margin.top })`);

  // Data preprocessing
  const data = Graph3_data_cleaning(column_from_csv);

  // Create the X scale
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.make))
    .range([0, width])
    .padding(0.1);

  // Create the Y scale
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.avgPrice)])
    .nice()
    .range([height, 0]);

  // Create the X axis
  chartContainer_graph3.append("g")
    .attr("transform", `translate(0, ${ height })`)
    .call(d3.axisBottom(xScale));

  // Create the Y axis
  chartContainer_graph3.append("g")
    .call(d3.axisLeft(yScale));

  // Create the scatter plot
  chartContainer_graph3.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.make) + xScale.bandwidth() / 2)
    .attr("cy", d => yScale(d.avgPrice))
    .attr("r", 5)
    .attr("fill", "blue");

  // Add the X axis label
  chartContainer_graph3.append("text")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("Manufacturer")
    .style("font-weight", "bold");

  // Add the Y axis label
  chartContainer_graph3.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .text("Average Price")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .style("font-weight", "bold");
}

