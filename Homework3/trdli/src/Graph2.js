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
  const data_cleaned = Graph2_data_cleaning();
  const recieved_clean_result = data_cleaned.FinalData;
  const yearRangeData = data_cleaned.yearRangeData;

  // Track the current view state
  let currentState =
  {
    view: 'year',
    selectedRegion: null
  };

  // Define the event listener as a named function
  function onNodeSelected(event)
  {
    const { category, value } = event.detail;

    // Check if it's a second click
    if (category === null && value === null)
    {
      // If it's a click on the same region, reset to the year view
      currentState.view = 'year';
      currentState.selectedRegion = null;
      drawChart(recieved_clean_result, width, height, chartContainer_graph2);
    }
    else
    {
      // If clicked is different from the current view, update the chart
      if (category === 'year')
      {
        currentState.view = 'year';
        currentState.selectedRegion = value;
        updateChart(value, yearRangeData, width, height, chartContainer_graph2);
      }
    }
  }

  // Remove any existing event listeners before adding new one
  window.removeEventListener('nodeSelected', onNodeSelected);
  window.addEventListener('nodeSelected', onNodeSelected);

  // Initial draw
  drawChart(recieved_clean_result, width, height, chartContainer_graph2);
}

function drawChart(data, width, height, chartContainer_graph2)
{
  // Clear previous chart
  chartContainer_graph2.selectAll("*").remove();

  // Set up the x and y axis
  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.price)]) // Start y-axis from 0
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
  const years = data.map(d => d.year);
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
    .datum(data)
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
    .text("Average Price")
    .style("font-size", "12px");

  // Create the color legend next to the line chart
  const colorLegend = chartContainer_graph2.selectAll(".color-legend")
    .data(data)
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

  // Add a group for the tooltip and dashed line
  const tooltipGroup = chartContainer_graph2.append("g")
    .attr("class", "tooltip-group")
    .style("display", "none");

  tooltipGroup.append("text")
    .attr("class", "tooltip-text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .style("font-weight", "bold");

  // Add data points to the line chart
  chartContainer_graph2.selectAll(".data-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("cx", d => x(d.year) + x.bandwidth() / 2)
    .attr("cy", d => y(d.price))
    .attr("r", 5)
    .attr("fill", d => colors(years.indexOf(d.year)))
    .on("mouseover", function (event, d)
    {
      d3.select(this)
        .attr("r", 7);

      // Show the tooltip
      tooltipGroup.style("display", null)
        .attr("transform", `translate(${ x(d.year) + x.bandwidth() / 2 }, ${ y(d.price) - 10 })`);

      // Update the tooltip text
      tooltipGroup.select(".tooltip-text")
        .text(`$${ d.price.toFixed(2) }`);
    })
    .on("mouseout", function ()
    {
      d3.select(this)
        .attr("r", 5);
      tooltipGroup.style("display", "none");
    });
}

function updateChart(value, yearRangeData, width, height, chartContainer_graph2)
{
  let yearRange = [];
  let recievedYear = parseInt(value);
  for (let index = 0; index < 5; index++)
  {
    yearRange.push(index + recievedYear);
  }

  // Filter data based on the selected year range
  const filteredData = yearRangeData.filter(d => yearRange.includes(d.year));
  console.log(filteredData);
  // Redraw the chart with the filtered data
  drawChart(filteredData, width, height, chartContainer_graph2);
}
