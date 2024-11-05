import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { column_from_csv } from './csvReadIn.js';
import { Graph3_data_cleaning } from './graphDataCleaning.js';

/** For this graph, we would like to create a pie chart to show the relationship
 * between the region and the number of cars sold. As you click on a region in graph 1,
 * the pie chart will change to show the distribution of the car sold of this region manufacture.
*/
export function Graph3_Detail()
{
  // First, clear any existing content
  d3.select('#Graph3').selectAll("*").remove();

  // Set up SVG dimensions
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom;
  const radius = (Math.min(width, height) / 3.1415926) + 50;

  // Create the main SVG container
  const chartContainer_pie = d3.select('#Graph3')
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
    category: d.category,
    count: d.count,
    percentage: (d.count / total) * 100
  }));

  // Set up the color scale based on the category
  const color = d3.scaleOrdinal()
    .domain(regionPercentages.map(d => d.category))
    .range(d3.schemeCategory10);

  // create the pie
  const pie = d3.pie().value(d => d.count);

  // Create the arc generator
  const arc = d3.arc().innerRadius(5).outerRadius(radius);
  // Create the hover arc generator
  const arcHover = d3.arc().innerRadius(5).outerRadius(radius * 1.15);

  // Initial drawing
  drawChart(regionPercentages, pie, arc, color, chartContainer_pie, arcHover, radius, true);

  // Track the current view state
  let currentState = {
    view: 'region',  // 'region' or 'manufacturer'
    selectedRegion: null
  };

  // Define the event listener as a named function
  function onNodeSelected(event)
  {
    const { category, value } = event.detail;

    if (category === null && value === null)
    {
      currentState.view = 'region';
      currentState.selectedRegion = null;
      drawChart(regionPercentages, pie, arc, color, chartContainer_pie, arcHover, radius, true);
    }
    else
    {
      if (category === 'region')
      {
        currentState.view = 'manufacturer';
        currentState.selectedRegion = value;
        updateChart(value, manufactorData, pie, arc, color, chartContainer_pie, arcHover, radius, true);
      }
      else
      {
        // If category is not region or null, reset to region view and do not make animation
        currentState.view = 'region';
        currentState.selectedRegion = null;
        drawChart(regionPercentages, pie, arc, color, chartContainer_pie, arcHover, radius, false);
      }
    }
  }

  // Remove any existing event listeners before adding new one
  window.removeEventListener('nodeSelected', onNodeSelected);
  window.addEventListener('nodeSelected', onNodeSelected);
}

function drawChart(data, pie, arc, color, chartContainer_pie, arcHover, radius, makeAnimation)
{
  // Clear existing content
  chartContainer_pie.selectAll("*").remove();

  const pieData = pie(data);

  // Create the arcs
  const arcs = chartContainer_pie.selectAll(".arc")
    .data(pieData)
    .enter()
    .append("g")
    .attr("class", "arc");

  // Append the path for each arc with transition
  arcs.append("path")
    .attr("fill", d => color(d.data.category))
    .transition()
    .duration(makeAnimation ? 750 : 0)
    .attrTween("d", function (d)
    {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t)
      {
        return arc(interpolate(t));
      };
    });

  // Create the hover effect for the slices
  arcs.append("path")
    .attr("fill", d => color(d.data.category))
    .on("mouseover", function (d)
    {
      d3.select(this).transition()
        .duration(100)
        .attr("d", arcHover);

      chartContainer_pie.selectAll("text")
        .filter(textData => textData.data.category === d.data.category)
        .transition()
        .duration(100)
        .style("font-size", "14px");
    })
    .on("mouseout", function (d)
    {
      d3.select(this).transition()
        .duration(100)
        .attr("d", arc);

      chartContainer_pie.selectAll("text")
        .filter(textData => textData.data.key === d.data.key)
        .transition()
        .duration(100)
        .style("font-size", "10px");
    });

  // Create text labels with transition
  const textLabels = chartContainer_pie.selectAll("text")
    .data(pieData)
    .enter()
    .append("text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .text(d =>
    {
      const percentage = d.data.percentage.toFixed(2);
      return `${ d.data.category } (${ percentage }%)`;
    });

  textLabels.transition()
    .duration(makeAnimation ? 750 : 0)
    .attrTween("transform", function (d)
    {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t)
      {
        const interpolated = interpolate(t);
        const pos = arc.centroid(interpolated);
        const angle = midAngle(interpolated) * 180 / Math.PI - 90;
        pos[0] = pos[0] * 1.3;
        pos[1] = pos[1] * 1.3;
        let rotation;
        if (midAngle(interpolated) < Math.PI / 2)
        {
          rotation = angle;
        }
        else if (midAngle(interpolated) >= Math.PI / 2 && midAngle(interpolated) < Math.PI)
        {
          rotation = angle - 90;
        }
        else
        {
          rotation = angle + 180;
        }
        return `translate(${ pos }) rotate(${ rotation })`;
      };
    });

  // Create the color legend next to the pie chart
  const colorLegend = chartContainer_pie.selectAll(".color-legend")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "color-legend")
    .attr("transform", (d, i) => `translate(${ radius + 20 }, ${ 20 + i * 20 })`);

  colorLegend.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", d => color(d.category));

  colorLegend.append("text")
    .attr("x", 15)
    .attr("y", 10)
    .style("font-size", "10px")
    .text(d => d.category);
}

function updateChart(region, manufactorData, pie, arc, color, chartContainer_pie, arcHover, radius, makeAnimation)
{
  const JapaneseMakes = ['toyota', 'isuzu', 'honda', 'nissan', 'subaru', 'mazda', 'iszuzu', 'mitsubishi', 'suzuki', 'daihatsu', 'lexus', 'infiniti', 'acura', 'scion'];
  const EuropeanMakes = ['volkswagen', 'geo', 'rolls-royce', 'fisker', 'audi', 'bmw', 'mercedes-benz', 'porsche', 'volvo', 'saab', 'fiat', 'alfa', 'jaguar', 'land rover', 'mini', 'smart', 'bentley', 'rolls royce', 'aston martin', 'lotus', 'maserati', 'lamborghini', 'ferrari'];
  const AmericanMakes = ['ford', 'ram', 'chevrolet', 'dodge', 'jeep', 'chrysler', 'cadillac', 'lincoln', 'buick', 'gmc', 'plymouth', 'saturn', 'pontiac', 'oldsmobile', 'mercury', 'hummer', 'tesla'];
  const KoreanMakes = ['hyundai', 'kia', 'genesis', 'daewoo', 'ssangyong'];

  let filteredData = [...manufactorData];
  if (region === 'American')
  {
    filteredData = manufactorData.filter(d => AmericanMakes.includes(d.make.toLowerCase()));
  } else if (region === 'Japanese')
  {
    filteredData = manufactorData.filter(d => JapaneseMakes.includes(d.make.toLowerCase()));
  } else if (region === 'European')
  {
    filteredData = manufactorData.filter(d => EuropeanMakes.includes(d.make.toLowerCase()));
  } else if (region === 'Korean')
  {
    filteredData = manufactorData.filter(d => KoreanMakes.includes(d.make.toLowerCase()));
  }

  const total = d3.sum(filteredData, d => d.count);
  let pieData = filteredData.map(d => ({
    category: d.make,
    count: d.count,
    percentage: (d.count / total) * 100
  }));

  // Combine small percentages into 'Other'
  const otherData = pieData.filter(d => d.percentage < 2);
  const otherTotal = d3.sum(otherData, d => d.count);
  pieData = pieData.filter(d => d.percentage >= 2);
  if (otherTotal > 0)
  {
    pieData.push({
      category: 'Other',
      count: otherTotal,
      percentage: (otherTotal / total) * 100
    });
  }
  drawChart(pieData, pie, arc, color, chartContainer_pie, arcHover, radius, makeAnimation);
}

function midAngle(d)
{
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}
