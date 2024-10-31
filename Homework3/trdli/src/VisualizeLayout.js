import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';
import { Graph1_Overall } from './Graph1.js';
import { Graph2_Detail } from './Graph2.js';
import { Graph3_Detail } from './Graph3.js';
import { column_from_csv } from './csvReadIn.js';

export let size = { width: 0, height: 0 };
/**
 * Handles the resize event for specified target elements and redraws the
 * corresponding graphs.
 * @param {Array} targets - An array of ResizeObserverEntry objects
 * representing the elements being resized.
 * @param {ResizeObserverEntry} targets[].target - The target element being
 * resized.
 * @param {DOMRectReadOnly} targets[].contentRect - The new size of the
 * target element.
 * The function checks if the resized element's ID matches one of the
 * predefined graph container IDs. If it matches, it updates the size and
 * redraws the corresponding graph using D3.js.
 */
const onResize = (targets) =>
{
  targets.forEach(target =>
  {
    const targetId = target.target.getAttribute('id');
    if (!['parallel-coordinates-container-graph1', 'pie-container-graph2',
      'bar-container-graph3'].includes(targetId)) return;

    size = {
      width: target.contentRect.width, height:
        target.contentRect.height
    };
    if (isEmpty(size) || isEmpty(column_from_csv)) return;

    const graphMap = {
      'parallel-coordinates-container-graph1': {
        selector: '#Graph1',
        redraw: Graph1_Overall
      },
      'pie-container-graph2': { selector: '#Graph2', redraw: Graph2_Detail },
      'bar-container-graph3': { selector: '#Graph3', redraw: Graph3_Detail }
    };

    d3.select(graphMap[targetId].selector).selectAll('*').remove();
    graphMap[targetId].redraw();
  });
};

/**
 * @description Generates the overall view for Graph1.
 * @name Graph1_OverallView
 * @returns {string} HTML string containing a div with an SVG element for
 * Graph1.
 */
export const Graph1_OverallView = () => (
  `<div id='parallel-coordinates-container-graph1'>
        <svg id='Graph1'></svg>
        <p>
          <b> Graph 1. </b> Overview of car sales trends from 1986 to 2015.
        </p>
    </div>`
);

/**
 * @description Generates the HTML structure for the detailed view of Graph2.
 * @name Graph2_DetailView
 * @returns {string} The HTML string for the detailed view of Graph2.
 */
export const Graph2_DetailView = () => (
  `<div id='pie-container-graph2'>
      <svg id='Graph2'></svg>
      <p>
        <b> Graph 2. </b> The distribution of people's brand preferences by percentage.
      </p>
    </div>
    `
);

/**
 * @description Generates the HTML structure for the detailed view of Graph
 * 3.
 * @name Graph3_DetailView
 * @returns {string} The HTML string containing a div with an SVG element.
 */
export const Graph3_DetailView = () => (
  `<div id='bar-container-graph3'>
        <svg id='Graph3'></svg>
        <p>
          <b> Graph 3. </b> The number of cars sold each year.
        </p>
    </div>`
);

const chartObserver = new ResizeObserver(debounce(onResize, 100));


/* For graph 1, we would like to draw a parallel coordinates chart. The
vertical lines would be the year, model, make, body, odometer, and price of
the cars. By connecting those lines, we can see the relationship between the
car attributes and the price. Keep in mind here, the prince and odometer are
binned into ranges for better performance. To do that, we
need to cleanup our data first.*/

/**
 * @brief Mounts the chart for Graph1.
 * @function mountChart1
 * @returns {void}
 */
export function mountChart1()
{
  let Graph1Container =
    document.querySelector('#parallel-coordinates-container-graph1');
  chartObserver.observe(Graph1Container);
}

/** For this chart, we want to see how many cars were being sold for each car
 * makers, we especially care for the non-luxury brands and more consider for
 * the family use. So it has to be a selection for the majority. We will use
 * a pie chart to demonstrate this by showing the percentage of each car
 * brand sell situation.*/
export function mountChart2()
{
  let Graph2Container = document.querySelector('#pie-container-graph2');
  chartObserver.observe(Graph2Container);
}

/** For the third chart, we would like to see the distribution of buyer's
 * choice based on years. To be more specific, we would like to see how many
 * cars were sold in each year. We will use a bar chart to demostrate this */
export function mountChart3()
{
  let Graph3Container = document.querySelector('#bar-container-graph3');
  chartObserver.observe(Graph3Container);
}

