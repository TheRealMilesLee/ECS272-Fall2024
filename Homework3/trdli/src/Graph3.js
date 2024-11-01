import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { column_from_csv } from './csvReadIn.js';
import { Graph3_data_cleaning } from './graphDataCleaning.js';

/**
 * For this chart, we want to know the percentage of cars sold by each region.
 * For later animation, we will change our data to one specific region and see the distribution of car brands.
 */
export function Graph3_Detail()
{
  // Set up SVG dimensions
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom;
  const radius = (Math.min(width, height) / 3.1415926) + 50;
  let chartContainer_pie = d3.select('#Graph3')
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${ width / 2 }, ${ height / 2 })`);

  // Data preprocessing
  const data = Graph3_data_cleaning(column_from_csv);
  const regionCategory = data.region;
  const manufactorData = data.manufactor;

  // Compute each region's percentage of cars sold
  const total = d3.sum(regionCategory, d => d.count);
  const regionPercentages = regionCategory.map(d => ({
    key: d.category,
    value: d.count,
    percentage: (d.count / total) * 100
  }));

  // Set up the color scale based on the category
  const color = d3.scaleOrdinal()
    .domain(regionPercentages.map(d => d.key))
    .range(d3.schemeCategory10);


  // create the pie
  const pie = d3.pie().value(d => d.value);


  // Create the arc generator
  const arc = d3.arc().innerRadius(5).outerRadius(radius);
  // Create the hover arc generator
  const arcHover = d3.arc().innerRadius(5).outerRadius(radius * 1.15);

  // Create the arcs
  const arcs = chartContainer_pie.selectAll(".arc")
    .data(pie(regionPercentages))
    .enter()
    .append("g")
    .attr("class", "arc");

  // Append the path for each arc
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.key));

  // Create the hover effect for the slices
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.key))
    .on("mouseover", function (event, d) // Add hover effect
    {
      d3.select(this).transition()
        .duration(100) // Set the duration of the transition
        .attr("d", arcHover);

      // Enlarge the corresponding text label
      chartContainer_pie.selectAll("text")
        .filter(textData => textData.data.key === d.data.key)
        .transition()
        .duration(100)
        .style("font-size", "14px");
    })
    .on("mouseout", function (event, d)
    {
      d3.select(this).transition()
        .duration(100) // Set the duration of the transition
        .attr("d", arc);

      // Reset the corresponding text label size
      chartContainer_pie.selectAll("text")
        .filter(textData => textData.data.key === d.data.key)
        .transition()
        .duration(100)
        .style("font-size", "10px");
    });

  // Create text labels, this is inside of the pie chart, the label would rotate to fit into the slices
  chartContainer_pie.selectAll("text")
    .data(pie(regionPercentages))
    .enter()
    .append("text")
    .attr("transform", function (d)
    {
      const pos = arc.centroid(d);
      const angle = midAngle(d) * 180 / Math.PI - 90;
      pos[0] = pos[0] * 1.3; // Move the label slightly outwards
      pos[1] = pos[1] * 1.3; // Move the label slightly outwards
      return `translate(${ pos }) rotate(${ angle })`;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d =>
    {
      const percentage = d.data.percentage.toFixed(2);
      return `${ d.data.key } (${ percentage }%)`;
    })
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .attr("transform", function (d)
    {
      const pos = arc.centroid(d);
      const angle = midAngle(d) * 180 / Math.PI - 90;
      pos[0] = pos[0] * 1.3; // Move the label slightly outwards
      pos[1] = pos[1] * 1.3; // Move the label slightly outwards
      const rotation = (['Korean', 'European', 'Japanese'].includes(d.data.key)) ? angle + 180 : angle;
      return `translate(${ pos }) rotate(${ rotation })`;
    });

  /**
   * Calculates the midpoint angle of a given arc.
   *
   * @param {Object} d - An object representing the arc.
   * @param {number} d.startAngle - The starting angle of the arc.
   * @param {number} d.endAngle - The ending angle of the arc.
   * @returns {number} The midpoint angle of the arc.
   */
  function midAngle(d)
  {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
}
