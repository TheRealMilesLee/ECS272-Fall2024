import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { column_from_csv } from './csvReadIn.js';
import { Graph3_data_cleaning } from './graphDataCleaning.js';

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
  const svg = d3.select('#Graph3')
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet");

  const chartContainer_pie = svg.append("g")
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

  // Initial drawing
  drawChart(regionPercentages, pie, arc, color, chartContainer_pie, arcHover);

  // Track the current view state
  let currentState = {
    view: 'region',  // 'region' or 'manufacturer'
    selectedRegion: null
  };

  // Define the event listener as a named function
  function onNodeSelected(event)
  {
    const { category, value } = event.detail;

    // 先判断是否是二次点击
    if (category === null && value === null)
    {
      // 如果是点击相同的区域，重置回区域视图
      currentState.view = 'region';
      currentState.selectedRegion = null;
      drawChart(regionPercentages, pie, arc, color, chartContainer_pie, arcHover);
    }
    else
    {
      // 如果是点击不同区域，且是region类别
      if (category === 'region')
      {
        currentState.view = 'manufacturer';
        currentState.selectedRegion = value;
        updateChart(value, manufactorData, pie, arc, color, chartContainer_pie, arcHover);
      }
    }
  }

  // Remove any existing event listeners before adding new one
  window.removeEventListener('nodeSelected', onNodeSelected);
  window.addEventListener('nodeSelected', onNodeSelected);
}

function drawChart(data, pie, arc, color, chartContainer_pie, arcHover)
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

  // Append the path for each arc
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.key));

  // Create the hover effect for the slices
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.key))
    .on("mouseover", function (event, d)
    {
      d3.select(this).transition()
        .duration(100)
        .attr("d", arcHover);

      chartContainer_pie.selectAll("text")
        .filter(textData => textData.data.key === d.data.key)
        .transition()
        .duration(100)
        .style("font-size", "14px");
    })
    .on("mouseout", function (event, d)
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

  // Create text labels
  chartContainer_pie.selectAll("text")
    .data(pieData)
    .enter()
    .append("text")
    .attr("transform", function (d)
    {
      const pos = arc.centroid(d);
      const angle = midAngle(d) * 180 / Math.PI - 90;
      pos[0] = pos[0] * 1.3;
      pos[1] = pos[1] * 1.3;
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
      pos[0] = pos[0] * 1.3;
      pos[1] = pos[1] * 1.3;
      const rotation = (['Korean', 'European', 'Japanese'].includes(d.data.key)) ? angle + 180 : angle;
      return `translate(${ pos }) rotate(${ rotation })`;
    });
}

function updateChart(region, manufactorData, pie, arc, color, chartContainer_pie, arcHover)
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
    key: d.make,
    value: d.count,
    percentage: (d.count / total) * 100
  }));

  // Combine small percentages into 'Other'
  const otherData = pieData.filter(d => d.percentage < 2);
  const otherTotal = d3.sum(otherData, d => d.value);
  pieData = pieData.filter(d => d.percentage >= 2);
  if (otherTotal > 0)
  {
    pieData.push({
      key: 'Other',
      value: otherTotal,
      percentage: (otherTotal / total) * 100
    });
  }

  drawChart(pieData, pie, arc, color, chartContainer_pie, arcHover);
}

function midAngle(d)
{
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}
