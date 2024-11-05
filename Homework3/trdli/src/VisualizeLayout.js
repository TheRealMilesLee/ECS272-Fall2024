import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { Graph1_Overall } from './Graph1.js';
import { Graph2_Detail } from './Graph2.js';
import { Graph3_Detail } from './Graph3.js';
import { column_from_csv } from './csvReadIn.js';

export let size = { width: 0, height: 0 };

/**
 * @brief Handles the resize event for specified target elements and redraws the corresponding graphs.
 *
 * @param {Array} targets - An array of ResizeObserverEntry objects representing the elements being resized.
 *
 * The function checks if the resized element's ID is one of the specified graph IDs ('Sankey-Graph1', 'LineChart-Graph2', 'PieChart-Graph3').
 * If it is, it retrieves the new size of the element and redraws the corresponding graph using D3.js.
 *
 * The graphMap object maps each graph ID to its corresponding selector and redraw function.
 * The function removes all existing elements within the graph's container before calling the redraw function.
 */
const onResize = (targets) =>
{
  targets.forEach(target =>
  {
    const targetId = target.target.getAttribute('id');
    if (!['Sankey-Graph1', 'LineChart-Graph2', 'PieChart-Graph3'].includes(targetId)) return;
    size = { width: target.contentRect.width, height: target.contentRect.height };
    if (isEmpty(size) || isEmpty(column_from_csv)) return;
    const graphMap = {
      'Sankey-Graph1': {
        selector: '#Graph1',
        redraw: Graph1_Overall
      },
      'LineChart-Graph2': { selector: '#Graph2', redraw: Graph2_Detail },
      'PieChart-Graph3': { selector: '#Graph3', redraw: Graph3_Detail }
    };
    d3.select(graphMap[targetId].selector).selectAll('*').remove();
    graphMap[targetId].redraw();
  });
};


/**
 * @brief Generates the HTML structure for the overall view of used car sold situation.
 *
 * This function returns a string containing a div with an SVG element and a description.
 * The div has an id of 'Sankey-Graph1' and the SVG has an id of 'Graph1'.
 *
 * @returns {string} The HTML string for the overall view of used car sold situation.
 */
export const Graph1_OverallView = () => (
  `<div id='Sankey-Graph1'>
        <svg id='Graph1'></svg>
        <i>  <b> Graph 1. </b> Overall View of used car sold situation. (Click region and year to learn more)</i>
    </div>`
);


/**
 * @brief Generates the HTML structure for the detailed view of Graph 2.
 *
 * This function returns a string containing a div element with an SVG element
 * and a description for Graph 2, which shows the correlation between Year and
 * Average Price for Used Cars.
 *
 * @returns {string} The HTML string for the detailed view of Graph 2.
 */
export const Graph2_DetailView = () => (
  `<div id='LineChart-Graph2'>
      <svg id='Graph2'></svg>
      <i> <b> Graph 2. </b> Correlation between Year and Average Price for Used Cars (Hover on the data point to learn more)</i>
    </div>`
);


/**
 * @brief Generates the HTML structure for the detailed view of Graph 3.
 *
 * This function returns a string containing the HTML structure for displaying
 * Graph 3, which shows the percentage of cars sold by region. The HTML includes
 * a container div with an SVG element and a descriptive text.
 *
 * @returns {string} The HTML structure for the detailed view of Graph 3.
 */
export const Graph3_DetailView = () => (
  `<div id='PieChart-Graph3'>
        <svg id='Graph3'></svg>
        <i> <b> Graph 3. </b> Percentage of Cars Sold by Region </i>
    </div>`
);

const chartObserver = new ResizeObserver(debounce(onResize, 100));


/** For graph 1, we would like to draw a Sankey chart. The
* vertical lines would be the year, model, make, body, odometer, and price of
* the cars. By connecting those lines, we can see the relationship between the
* car attributes and the price. Keep in mind here, the prince and odometer are
* binned into ranges for better performance. To do that, we
* need to cleanup our data first.*/
export function mountChart1()
{
  let Graph1Container = document.querySelector('#Sankey-Graph1');
  chartObserver.observe(Graph1Container);
}

/** For this chart, we want to see the correlation between year range and car price.
 * By looking at this chart, we want to find out how does the year affecting the car price.
 * So we will be using a line chart, where X axis is the year range and the Y axis is the average price
 * of the car. By showing the line, we could have a trend of how this correlation change. */
export function mountChart2()
{
  let Graph2Container = document.querySelector('#LineChart-Graph2');
  chartObserver.observe(Graph2Container);
}

/** For this chart, we would like to see the distribution of the manufactors. The general view would be region based,
 * so we could choose our car based on whether is a Japanese maker or it's a American maker. Then, by selecting the
 * region in chart 1, this chart would transfer into show the distribution of the manufactors in that region.
 */
export function mountChart3()
{
  let Graph3Container = document.querySelector('#PieChart-Graph3');
  chartObserver.observe(Graph3Container);
}

