import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { column_from_csv } from './csvReadIn.js';

/**
 * @brief The function `Graph2_data_cleaning` filters out non-luxury car brands from a dataset based on a predefined list of luxury brands and groups the data by car maker, counting the number of cars sold.
 * @returns {Object} An object containing the filtered data array and the total count of cars sold for non-luxury brands.
 */
function Graph2_data_cleaning()
{
  const cleanedData = column_from_csv.map(d =>
  {
    const make = d.make.toLowerCase();
    const luxuryBrands = ['ferrari', 'rolls-royce', 'fisker', 'tesla',
      'lamborghini', 'bentley', 'porsche', 'bmw', 'mercedes-benz', 'jaguar',
      'land rover', 'maserati', 'alfa romeo', 'fiat', 'smart', 'hummer',
      'lotus', 'aston martin'];
    if (!luxuryBrands.includes(make))
    {
      return {
        make: make,
      };
    }
    return null;
  }).filter(d => d !== null);  // Filter out null entries

  // Group the data by car maker and count the number of cars sold
  const carMakerCount = d3.rollup(cleanedData, v => v.length, d => d.make);
  // Convert the Map to an array for pie chart
  const data = Array.from(carMakerCount, ([make, count]) => ({ make, count }));

  // Merge the low percentage makers (percentage < 2.5) into 'Other'
  let total = d3.sum(data, d => d.count);
  let otherCount = 0;
  const filteredData = data.filter(d =>
  {
    if (d.count / total * 100 < 2.5)
    {
      otherCount += d.count;
      return false;
    }
    return true;
  });

  if (otherCount > 0)
  {
    filteredData.push({ make: 'Other', count: otherCount });
  }

  return { filteredData, total };
}

/**
 * @brief The function `Graph2_Detail` creates a pie chart based on car maker
 * data, grouping low percentage makers into 'Other' and displaying labels
 * and lines connecting slices.
 * @returns The `Graph2_Detail` function is setting up a pie chart
 * visualization based on car maker data.
 */
export function Graph2_Detail()
{
  // Set up the margin for the chart
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom - 10;

  // Set up the SVG container
  const chartContainer_graph2 = d3.select("#Graph2")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${ width / 2 }, ${ height / 2 })`);

  // Clean the data and get the filtered data and total number of car make
  const recieved_clean_result = Graph2_data_cleaning();
  const filteredData = recieved_clean_result.filteredData;
  const total_number_of_car_make = recieved_clean_result.total;

  /** Data cleaning finished, now we can start to draw the pie chart */

  // Config the size of the pie
  const radius = (Math.min(width, height) / 3.1415926) + 50;

  // Set up the color scale based on the car maker
  const color = d3.scaleOrdinal()
    .domain(filteredData.map(d => d.make))
    .range(d3.schemeCategory10);

  // Create the pie layout, value is the count of cars sold
  const pie = d3.pie().value(d => d.count);

  // Create the arc generator, innerRadius is 5, outerRadius is radius
  const arc = d3.arc().innerRadius(5).outerRadius(radius);

  // Create the arc generator for hover effect, it with expand the arc by 1.15
  const arcHover = d3.arc().innerRadius(5).outerRadius(radius * 1.15);

  // Bind data and create pie chart slices
  const arcs = chartContainer_graph2.selectAll(".arc")
    .data(pie(filteredData))
    .enter()
    .append("g")
    .attr("class", "arc");

  // Create the hover effect for the slices
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.make))
    .on("mouseover", function (event, d) // Add hover effect
    {
      d3.select(this).transition()
        .duration(100) // Set the duration of the transition
        .attr("d", arcHover);

      // Enlarge the corresponding text label
      chartContainer_graph2.selectAll("text")
        .filter(textData => textData.data.make === d.data.make)
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
      chartContainer_graph2.selectAll("text")
        .filter(textData => textData.data.make === d.data.make)
        .transition()
        .duration(100)
        .style("font-size", "10px");
    });

  // Create text labels, this is inside of the pie chart, the label would rotate to fit into the slices
  chartContainer_graph2.selectAll("text")
    .data(pie(filteredData))
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
      const percentage = ((d.data.count / total_number_of_car_make) * 100).toFixed(2);
      return `${ d.data.make } (${ percentage }%)`;
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
      const rotation = (['toyota', 'dodge', 'chrysler', 'jeep', 'infiniti', 'hyundai', 'honda', 'kia', 'nissan', 'volksvagen'].includes(d.data.make)) ? angle + 180 : angle;
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
};
