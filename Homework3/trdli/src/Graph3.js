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
  // 清空图表容器，确保不会有重叠
  d3.select('#Graph3').html("");

  // Set up SVG dimensions
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom;
  const radius = (Math.min(width, height) / 3.1415926) + 50;

  // 创建新的 SVG 和 g 容器
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
    .attr("fill", d => color(d.data.key))
    .on("mouseover", function (event, d) // Add hover effect
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
    .data(pie(regionPercentages))
    .enter()
    .append("text")
    .attr("transform", function (d)
    {
      const pos = arc.centroid(d);
      const angle = midAngle(d) * 180 / Math.PI - 90;
      pos[0] = pos[0] * 1.3;
      pos[1] = pos[1] * 1.3;
      const rotation = (['Korean', 'European', 'Japanese'].includes(d.data.key)) ? angle + 180 : angle;
      return `translate(${ pos }) rotate(${ rotation })`;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => `${ d.data.key } (${ d.data.percentage.toFixed(2) }%)`)
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("fill", "black");

  // Listen Graph 1 onClick event
  let lastClick = '';
  window.addEventListener('nodeSelected', (event) =>
  {
    const { category, value } = event.detail; // 通过 event.detail 获取传递的参数
    if (category === 'region')
    {
      let currentClick = category;
      if (lastClick === currentClick)
      {
        Graph3_Detail(); // Reset to initial state
        lastClick = ''; // Reset lastClick to allow toggling back
      }
      else
      {
        // Update the chart based on the selected category and value
        updateChart(value, manufactorData, pie, arc, color, chartContainer_pie, arcHover);
        lastClick = currentClick;
      }
    }
  });
}


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

function updateChart(value, manufactorData, pie, arc, color, chartContainer_pie, arcHover)
{
  const JapaneseMakes = ['toyota', 'isuzu', 'honda', 'nissan', 'subaru', 'mazda', 'iszuzu', 'mitsubishi', 'suzuki', 'daihatsu', 'lexus', 'infiniti', 'acura', 'scion'];
  const EuropeanMakes = ['volkswagen', 'geo', 'rolls-royce', 'fisker', 'audi', 'bmw', 'mercedes-benz', 'porsche', 'volvo', 'saab', 'fiat', 'alfa', 'jaguar', 'land rover', 'mini', 'smart', 'bentley', 'rolls royce', 'aston martin', 'lotus', 'maserati', 'lamborghini', 'ferrari'];
  const AmericanMakes = ['ford', 'ram', 'chevrolet', 'dodge', 'jeep', 'chrysler', 'cadillac', 'lincoln', 'buick', 'gmc', 'plymouth', 'saturn', 'pontiac', 'oldsmobile', 'mercury', 'hummer', 'tesla'];
  const KoreanMakes = ['hyundai', 'kia', 'genesis', 'daewoo', 'ssangyong'];

  if (value === 'American')
  {
    manufactorData = manufactorData.filter(d => AmericanMakes.includes(d.make.toLowerCase()));
  }
  else if (value === 'Japanese')
  {
    manufactorData = manufactorData.filter(d => JapaneseMakes.includes(d.make.toLowerCase()));
  }
  else if (value === 'European')
  {
    manufactorData = manufactorData.filter(d => EuropeanMakes.includes(d.make.toLowerCase()));
  }
  else if (value === 'Korean')
  {
    manufactorData = manufactorData.filter(d => KoreanMakes.includes(d.make.toLowerCase()));
  }

  // Update the chart with the filtered data
  const total = d3.sum(manufactorData, d => d.count);
  let pieData = manufactorData.map(d => ({
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

  pieData = pie(pieData);

  // Remove the old arcs
  chartContainer_pie.selectAll("*").remove();

  // Update the arcs using pieData
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
    .data(pieData)
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
      const rotation = (d.startAngle + d.endAngle) / 2 > Math.PI ? angle + 180 : (d.startAngle + d.endAngle) / 2 === Math.PI ? angle + 90 : angle;
      return `translate(${ pos }) rotate(${ rotation })`;
    });
}
