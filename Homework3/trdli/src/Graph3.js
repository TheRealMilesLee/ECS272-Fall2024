import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { column_from_csv } from './csvReadIn.js';

/**
 * @brief The function `Graph3_Detail` creates a bar chart using D3.js to
 * visualize the number of cars sold per year.
 */
export function Graph3_Detail()
{
  // Set up SVG dimensions
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom - 60;

  let chartContainer_graph3 = d3.select('#Graph3')
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${ margin.left }, ${ margin.top })`);
  // Group data by year and count the number of cars for each year
  const carYearCount = d3.rollup(column_from_csv, v => v.length, d =>
    d.year);
  // Convert the Map to an array for bar chart
  const data = Array.from(carYearCount, ([year, count]) => ({
    year, count
  }));
  // Define color for the bars
  const colorScale = d3.scaleThreshold()
    .domain([10000, 50000, 100000])
    .range(['#ff0000', '#ffb700', '#d0ff00', '#0fd971']);

  function getColor(index)
  {
    return colorScale(index);
  }
  // Create the X scale
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.1);

  // Create the Y scale
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height, 0]);

  // Create the X axis
  chartContainer_graph3.append("g")
    .attr("transform", `translate(0, ${ height })`)
    .call(d3.axisBottom(xScale));

  // Create the Y axis
  chartContainer_graph3.append("g")
    .call(d3.axisLeft(yScale));

  // Create the bars
  chartContainer_graph3.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.year))
    .attr("y", height) // Start from the bottom
    .attr("width", xScale.bandwidth())
    .attr("height", 0) // Start with height 0
    .attr("fill", d => getColor(d.count))
    .transition()
    .duration(500)
    .delay((d, i) => i * 50) // Adding variable delay for the transition
    .attr("y", d => yScale(d.count)) // Transition to final position
    .attr("height", d => height - yScale(d.count)); // Transition to final height

  // Add the X axis label
  chartContainer_graph3.append("text")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("Year")
    .style("font-weight", "bold");

  // Add the Y axis label
  chartContainer_graph3.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .text("Number of car sold")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .style("font-weight", "bold");

  // Add a onHover event for the bars, when hover on the bar, the bar will display the number of cars sold in that year
  chartContainer_graph3.selectAll("rect")
    .on("mouseover", function (event, d)
    {
      const x = xScale(d.year) + xScale.bandwidth() / 2;
      const y = yScale(d.count) - 5;
      chartContainer_graph3.append("text")
        .attr("id", "tooltip")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d.count)
        .style("font-weight", "bold");

      // Add dashed horizontal line
      chartContainer_graph3.append("line")
        .attr("id", "dashed-line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");
    })
    .on("mouseout", function ()
    {
      chartContainer_graph3.select("#tooltip").remove();
      chartContainer_graph3.select("#dashed-line").remove();
    });
}
