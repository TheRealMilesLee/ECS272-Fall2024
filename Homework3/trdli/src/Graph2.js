import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { Graph2_data_cleaning } from './graphDataCleaning.js';
/**
 * @brief Creates a tree map visualization showing vehicle counts by odometer range
 * @returns A D3.js tree map with interactive tooltips showing top brands
 */
export function Graph2_Detail()
{
  // Set up the margin for the chart
  const margin = { top: 10, right: 10, bottom: 50, left: 10 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom;

  // Set up the SVG container
  const chartContainer_graph2 = d3.select("#Graph2")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${ margin.left }, ${ margin.top })`);

  // Clean the data and get the grouped data
  const recieved_clean_result = Graph2_data_cleaning();
  const data = recieved_clean_result.data;

  // Process data to get total count for each range
  const processedData = data.map(item => ({
    range: item.range,
    count: item.brands.reduce((sum, brand) => sum + brand.count, 0),
    brands: item.brands.sort((a, b) => b.count - a.count).slice(0, 3) // Get top 3 brands by count
  }));

  // Set up the color scale
  const colorScale = d3.scaleLinear()
    .domain([0, d3.max(processedData, d => d.count)])
    .range(["#2ab1fa", "#114561"]);

  // Set up the root hierarchy
  const root = d3.hierarchy({ children: processedData })
    .sum(d => d.count)
    .sort((a, b) => b.value - a.value);

  // Create the tree map layout
  d3.treemap().size([width, height]).padding(2)(root);

  // Create tooltip
  const tooltip = d3.select("body").selectAll("#tooltip").data([0])
    .join("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "rgba(255, 255, 255, 0.9)")
    .style("padding", "10px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.1)")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-size", "12px");

  // Add the rectangles for the tree map
  const nodes = chartContainer_graph2.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${ d.x0 }, ${ d.y0 })`);

  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => colorScale(d.data.count))
    .style("stroke", "#fff")
    .style("stroke-width", "1px")
    .on("mouseover", function (event, d)
    {
      const brandList = d.data.brands
        .map((brand, index) => `${ index + 1 }. ${ brand.brand }`)
        .join("<br>");

      tooltip.html(`
        Top 3 Brands:<br>
        ${ brandList }
      `)
        .style("left", `${ event.pageX + 10 }px`)
        .style("top", `${ event.pageY + 10 }px`)
        .style("opacity", 1);

      d3.select(this)
        .style("stroke", "#000")
        .style("stroke-width", "2px");
    })
    .on("mouseout", function ()
    {
      tooltip.style("opacity", 0);
      d3.select(this)
        .style("stroke", "#fff")
        .style("stroke-width", "1px");
    });

  // Add labels to the rectangles
  nodes.append("text")
    .attr("x", 5)
    .attr("y", 20)
    .selectAll("tspan")
    .data(d => [
      `${ d.data.range }`,
      `${ d.data.count.toLocaleString() } vehicles`
    ])
    .join("tspan")
    .attr("x", 5)
    .attr("y", (d, i) => 20 + i * 20)
    .text(d => d)
    .attr("fill", "white")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("text-shadow", "1px 1px 1px rgba(0,0,0,0.5)");
}
