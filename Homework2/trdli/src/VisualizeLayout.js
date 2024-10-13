import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
const onResize = (targets) =>
{
  targets.forEach(target =>
  {
    if (target.target.getAttribute('id') !== 'bar-container-graph1') return;
    if (target.target.getAttribute('id') !== 'bar-container-graph2') return;
    if (target.target.getAttribute('id') !== 'bar-container-graph3') return;
    size = { width: target.contentRect.width, height: target.contentRect.height };
    if (!isEmpty(size) && !isEmpty(dataFromCSV))
    {
      d3.select('#Graph1').selectAll('*').remove();
      Graph1_Overall();
      d3.select('#Graph2').selectAll('*').remove();
      Graph2_Detail();
      d3.select('#Graph3').selectAll('*').remove();
      Graph3_Detail();
    }
  });
};
export const Graph1_OverallView = ( // equivalent to <template> in Vue
  `<div class='chart-container d-flex' id='bar-container-graph1'>
        <svg id='Graph1' width='100%' height='100%'>
        </svg>
    </div>`
);
export const Graph2_DetailView = ( // equivalent to <template> in Vue
  `<div class='chart-container d-flex' id='bar-container-graph2'>
        <svg id='Graph2' width='100%' height='100%'>
        </svg>
    </div>`
);
export const Graph3_DetailView = ( // equivalent to <template> in Vue
  `<div class='chart-container d-flex' id='bar-container-graph3'>
        <svg id='Graph3' width='100%' height='100%'>
        </svg>
    </div>`
);
export const VisualizeLayout_grid = (`
  <br>
  <div>
    <div class="grid-container">
      <div class="left-side">${ Graph1_OverallView }</div>
      <div class="right-top">${ Graph2_DetailView }</div>
      <div class="right-bottom">${ Graph3_DetailView }</div>
    </div>
  </div>
  <br>
`);

export const Graph1_Detail = (`
  <div>
    <div class="detail-container">
      <div class="left-side"> ${ Graph1_OverallView } </div>
        <div class="right-side">
          <p> Here we place the explanation of the chart </p>
        </div>
    </div>
  </div>
  <br>
`);

export const Graph2_Detail_explaination = (`
  <div>
    <div class="detail-container">
        <div class="left-side">
          <p> Here we place the explanation of the chart </p>
        </div>
        <div class="right-side"> ${ Graph2_DetailView } </div>
    </div>
  </div>
  <br>
`);

export const Graph3_Detail_explaionation = (`
  <div>
    <div class="detail-container">
      <div class="left-side"> ${ Graph3_DetailView } </div>
        <div class="right-side">
          <p> Here we place the explanation of the chart </p>
        </div>
    </div>
  </div>
  <br>
`);

const chartObserver = new ResizeObserver(debounce(onResize, 100));
const dataFromCSV = await d3.csv('../data/car_prices.csv');
const margin = { left: 40, right: 20, top: 20, bottom: 60 };
var size = { width: 0, height: 0 };

export function mountChart1()
{ // registering this element to watch its size change
  let Graph1Container = document.querySelector('#bar-container-graph1');
  chartObserver.observe(Graph1Container);
}

export function mountChart2()
{ // registering this element to watch its size change
  let Graph2Container = document.querySelector('#bar-container-graph2');
  chartObserver.observe(Graph2Container);
}

export function mountChart3()
{ // registering this element to watch its size change
  let Graph3Container = document.querySelector('#bar-container-graph3');
  chartObserver.observe(Graph3Container);
}

function Graph1_Overall()
{
  // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
  let chartContainer = d3.select('#Graph1');
  let data = dataFromCSV;
  console.log(data);
  // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data
  // value, so the extents and the unique values above help us define the limits.
  // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range.
  //      In our case, x should be the data, y should be the screen pixels.
  // We have the margin here just to leave some space
  // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x).
  let xScale = d3.scaleBand()
    .rangeRound([margin.left, size.width - margin.right])
    .domain(xCategories)
    .padding(0.1); // spacing between the categories

  // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y).
  let yScale = d3.scaleLinear()
    .range([size.height - margin.bottom, margin.top]) //bottom side to the top side on the screen
    .domain([0, yExtents[1]]); // This is based on your data, but if there is a natural value range for your data attribute, you should follow
  // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

  // There are other scales such as scaleOrdinal,
  // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

  // This following part visualizes the axes along with axis labels.
  // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
  const xAxis = chartContainer.append('g')
    .attr('transform', `translate(0, ${ size.height - margin.bottom })`)
    .call(d3.axisBottom(xScale));

  const yAxis = chartContainer.append('g')
    .attr('transform', `translate(${ margin.left }, 0)`)
    .call(d3.axisLeft(yScale));

  const yLabel = chartContainer.append('g')
    .attr('transform', `translate(${ 10 }, ${ size.height / 2 }) rotate(-90)`)
    .append('text')
    .text('Value')
    .style('font-size', '.8rem');

  const xLabel = chartContainer.append('g')
    .attr('transform', `translate(${ size.width / 2 - margin.left }, ${ size.height - margin.top - 5 })`)
    .append('text')
    .text('Categories')
    .style('font-size', '.8rem');

  // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
  // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
  const barEles = chartContainer.append('g')
    .selectAll('rect')
    .data(bars) // TypeScript expression. This always expects an array of objects.
    .join('rect')
    // specify the left-top coordinate of the rectangle
    .attr('x', (d) => xScale(d.category))
    .attr('y', (d) => yScale(d.value))
    // specify the size of the rectangle
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => Math.abs(yScale(0) - yScale(d.value))) // this substraction is reversed so the result is non-negative
    .attr('fill', 'teal');

  // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
  const title = chartContainer.append('g')
    .append('text') // adding the text
    .attr('transform', `translate(${ size.width / 2 }, ${ size.height - margin.top + 5 })`)
    .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .text('Distribution of Demo Data'); // text content

}

function Graph2_Detail()
{
  // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
  let chartContainer = d3.select('#Graph2');
  let data = dataFromCSV;
  console.log(data);
  // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data
  // value, so the extents and the unique values above help us define the limits.
  // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range.
  //      In our case, x should be the data, y should be the screen pixels.
  // We have the margin here just to leave some space
  // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x).
  let xScale = d3.scaleBand()
    .rangeRound([margin.left, size.width - margin.right])
    .domain(xCategories)
    .padding(0.1); // spacing between the categories

  // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y).
  let yScale = d3.scaleLinear()
    .range([size.height - margin.bottom, margin.top]) //bottom side to the top side on the screen
    .domain([0, yExtents[1]]); // This is based on your data, but if there is a natural value range for your data attribute, you should follow
  // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

  // There are other scales such as scaleOrdinal,
  // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

  // This following part visualizes the axes along with axis labels.
  // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
  const xAxis = chartContainer.append('g')
    .attr('transform', `translate(0, ${ size.height - margin.bottom })`)
    .call(d3.axisBottom(xScale));

  const yAxis = chartContainer.append('g')
    .attr('transform', `translate(${ margin.left }, 0)`)
    .call(d3.axisLeft(yScale));

  const yLabel = chartContainer.append('g')
    .attr('transform', `translate(${ 10 }, ${ size.height / 2 }) rotate(-90)`)
    .append('text')
    .text('Value')
    .style('font-size', '.8rem');

  const xLabel = chartContainer.append('g')
    .attr('transform', `translate(${ size.width / 2 - margin.left }, ${ size.height - margin.top - 5 })`)
    .append('text')
    .text('Categories')
    .style('font-size', '.8rem');

  // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
  // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
  const barEles = chartContainer.append('g')
    .selectAll('rect')
    .data(bars) // TypeScript expression. This always expects an array of objects.
    .join('rect')
    // specify the left-top coordinate of the rectangle
    .attr('x', (d) => xScale(d.category))
    .attr('y', (d) => yScale(d.value))
    // specify the size of the rectangle
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => Math.abs(yScale(0) - yScale(d.value))) // this substraction is reversed so the result is non-negative
    .attr('fill', 'teal');

  // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
  const title = chartContainer.append('g')
    .append('text') // adding the text
    .attr('transform', `translate(${ size.width / 2 }, ${ size.height - margin.top + 5 })`)
    .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .text('Distribution of Demo Data'); // text content

}

function Graph3_Detail()
{
  // select the svg tag so that we can insert(render) elements, i.e., draw the chart, within it.
  let chartContainer = d3.select('#Graph3');
  let data = dataFromCSV;
  console.log(data);
  // We need a way to map our data to where it should be rendered within the svg (in screen pixels), based on the data
  // value, so the extents and the unique values above help us define the limits.
  // Scales are just like mapping functions y = f(x), where x refers to domain, y refers to range.
  //      In our case, x should be the data, y should be the screen pixels.
  // We have the margin here just to leave some space
  // In viewport (our screen), the leftmost side always refer to 0 in the horizontal coordinates in pixels (x).
  let xScale = d3.scaleBand()
    .rangeRound([margin.left, size.width - margin.right])
    .domain(xCategories)
    .padding(0.1); // spacing between the categories

  // In viewport (our screen), the topmost side always refer to 0 in the vertical coordinates in pixels (y).
  let yScale = d3.scaleLinear()
    .range([size.height - margin.bottom, margin.top]) //bottom side to the top side on the screen
    .domain([0, yExtents[1]]); // This is based on your data, but if there is a natural value range for your data attribute, you should follow
  // e.g., it is natural to define [0, 100] for the exame score, or [0, <maxVal>] for counts.

  // There are other scales such as scaleOrdinal,
  // whichever is appropriate depends on the data types and the kind of visualizations you're creating.

  // This following part visualizes the axes along with axis labels.
  // Check out https://observablehq.com/@d3/margin-convention?collection=@d3/d3-axis for more details
  const xAxis = chartContainer.append('g')
    .attr('transform', `translate(0, ${ size.height - margin.bottom })`)
    .call(d3.axisBottom(xScale));

  const yAxis = chartContainer.append('g')
    .attr('transform', `translate(${ margin.left }, 0)`)
    .call(d3.axisLeft(yScale));

  const yLabel = chartContainer.append('g')
    .attr('transform', `translate(${ 10 }, ${ size.height / 2 }) rotate(-90)`)
    .append('text')
    .text('Value')
    .style('font-size', '.8rem');

  const xLabel = chartContainer.append('g')
    .attr('transform', `translate(${ size.width / 2 - margin.left }, ${ size.height - margin.top - 5 })`)
    .append('text')
    .text('Categories')
    .style('font-size', '.8rem');

  // "g" is grouping element that does nothing but helps avoid DOM looking like a mess
  // We iterate through each <CategoricalBar> element in the array, create a rectangle for each and indicate the coordinates, the rectangle, and the color.
  const barEles = chartContainer.append('g')
    .selectAll('rect')
    .data(bars) // TypeScript expression. This always expects an array of objects.
    .join('rect')
    // specify the left-top coordinate of the rectangle
    .attr('x', (d) => xScale(d.category))
    .attr('y', (d) => yScale(d.value))
    // specify the size of the rectangle
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => Math.abs(yScale(0) - yScale(d.value))) // this substraction is reversed so the result is non-negative
    .attr('fill', 'teal');

  // For transform, check out https://www.tutorialspoint.com/d3js/d3js_svg_transformation.htm, but essentially we are adjusting the positions of the selected elements.
  const title = chartContainer.append('g')
    .append('text') // adding the text
    .attr('transform', `translate(${ size.width / 2 }, ${ size.height - margin.top + 5 })`)
    .attr('dy', '0.5rem') // relative distance from the indicated coordinates.
    .style('text-anchor', 'middle')
    .style('font-weight', 'bold')
    .text('Distribution of Demo Data'); // text content

}
