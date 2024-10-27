import * as d3 from 'd3';
import { isEmpty, debounce } from 'lodash';

let size = { width: 0, height: 0 };
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
let column_from_csv = await d3.csv('../data/car_prices.csv', (d) =>
{
  return {
    year: isNaN(+d.year) ? null : +d.year,
    make: d.make || "Unspecified",
    body: d.body || "Unspecified",
    odometer: isNaN(+d.odometer) ? null : +d.odometer,
    price: isNaN(+d.sellingprice) ? null : +d.sellingprice
  };
}).then(data =>
{
  // Filter out rows where any critical values are missing or invalid (null)
  // or price is 0
  return data.filter(d =>
  {
    return d.year !== null && d.make !== "Unspecified" && d.body !==
      "Unspecified"
      && d.odometer !== null && d.price !== null && d.price !== 0;
  });
});
// Sort the data by year
column_from_csv.sort((a, b) => a.year - b.year);

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

/**
 * @brief Cleans and categorizes data for graph1 visualization.
 *
 * This function processes the input data by categorizing years, makes, and
 * body types, and filtering out luxury brands and entries with a price of 0.
 * It also converts odometer and price values into specified numeric ranges.
 *
 * @function graph1_data_cleaning
 * @returns {Array<Object>} An array of cleaned and categorized data objects.
 *
 * @example
 * const cleanedData = graph1_data_cleaning();
 * console.log(cleanedData);
 */
function graph1_data_cleaning()
{
  const ranges = (value, steps) =>
  {
    for (let currentStepIndex = 0; currentStepIndex < steps.length;
      currentStepIndex++)
    {
      if (value < steps[currentStepIndex])
      {
        if (currentStepIndex === 0)
        {
          return 0;
        }
        else
        {
          const previousStep = steps[currentStepIndex - 1];
          const currentStep = steps[currentStepIndex];
          return (previousStep + currentStep) / 2;  // Use midpoint
        }
      }
    }
    return steps[steps.length - 1] + 5000;  // Handle values greater than the
    // last step
  };
  const yearRanges = [
    { start: 1980, end: 1985, label: '1980-1985' },
    { start: 1986, end: 1990, label: '1986-1990' },
    { start: 1991, end: 1995, label: '1991-1995' },
    { start: 1996, end: 2000, label: '1996-2000' },
    { start: 2001, end: 2005, label: '2001-2005' },
    { start: 2006, end: 2010, label: '2006-2010' },
    { start: 2011, end: 2015, label: '2011-2015' }
  ];

  const categorizeYear = (year) =>
  {
    for (const range of yearRanges)
    {
      if (year >= range.start && year <= range.end)
      {
        return range.label;
      }
    }
    return 'Unknown';
  };

  const categorizeBody = (body) =>
  {
    const bodyLower = body.toLowerCase();
    const categories = ['coupe', 'sedan', 'suv', 'minivan', 'truck', 'van',
      'wagon', 'hatchback', 'convertible', 'roadster', 'cab'];
    if (bodyLower.includes('koup'))
    {
      return 'coupe';
    }
    if (bodyLower.includes('navitgation'))
    {
      return 'suv'; // Exclude entries with 'navigation'
    }
    if (bodyLower.includes('supercrew'))
    {
      return 'truck';
    }
    return categories.find(category => bodyLower.includes(category)) ||
      bodyLower;
  };

  // Use a Set to track unique combinations of year, make, model, and body
  const uniqueEntries = new Set();

  return column_from_csv.map(d =>
  {
    const year = categorizeYear(d.year);
    const make = d.make.toLowerCase();
    const body = categorizeBody(d.body);
    const uniqueKey = `${ year }-${ make }-${ body }`;
    const luxuryBrands = ['ferrari', 'rolls-royce', 'fisker', 'tesla',
      'lamborghini', 'bentley', 'porsche', 'bmw', 'mercedes-benz', 'jaguar',
      'land rover', 'maserati', 'alfa romeo', 'fiat', 'smart', 'hummer',
      'lotus', 'aston martin'];
    if (!uniqueEntries.has(uniqueKey) && !luxuryBrands.includes(make))
    {
      uniqueEntries.add(uniqueKey);
      const odometer = ranges(d.odometer || 0, [5000, 10000, 15000, 20000,
        25000, 30000,
        35000, 40000, 45000, 50000]);
      const price = ranges(d.price || 0, [5000, 10000, 15000, 20000, 25000,
        30000, 35000]);
      if (price === 0) return null;  // Filter out entries with price 0
      return {
        year: year,
        make: make,
        body: body,
        odometer: odometer,  // Use numeric ranges
        price: price  // Use numeric ranges
      };
    }
    return null;
  }).filter(d => d !== null);  // Filter out null entries
}

const afterCleanData_Graph1 = graph1_data_cleaning();
/**
 * @brief Draws the overall view for Graph1 (Parallel Coordinates Chart).
 * @function Graph1_Overall
 * @returns {void}
 */
function Graph1_Overall()
{
  // Set up the margins for the chart
  const margin = { top: 20, right: 5, bottom: 35, left: 5 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom - 15;

  // Select the svg tag so that we can insert(render) elements, i.e., draw
  // the chart within it.
  const chartContainer_graph1 = d3.select("#Graph1")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("transform", `translate(${ margin.left },${ margin.top })`)
    .append("g")
    .attr("preserveAspectRatio", "xMidYMid meet");
  // Defined the categories for the parallel coordinates
  const dimensions = ['year', 'make', 'body', 'odometer', 'price'];

  // Defined the color that the line will be colored based on the make
  const colorScale = d3.scaleOrdinal()
    .domain(['1980-1985', '1986-1990', '1991-1995', '1996-2000', '2001-2005',
      '2006-2010', '2011-2015'])
    .range(['#FF3366', '#4834E0', '#00A676 ', '#F7B500', '#8B1E3F',
      '#3B1EC0', '#E45826']);

  function getColor(year)
  {
    return colorScale(year) || '#000000'; // default to black for unknown
  }
  const yScales = {};
  // Now we need to define the scales for each dimension. Linear scale for
  // numeric data
  ['odometer', 'price'].forEach(dimensions =>
  {
    const numeric_value = d3.extent(afterCleanData_Graph1,
      d => d[dimensions]);
    yScales[dimensions] = d3.scaleLinear()
      .domain(numeric_value)  // Ensure the domain is based on valid data
      .range([height - margin.bottom, margin.top]);
  });
  // 'make', 'body' are categorical, so we use ordinal scales
  ['year', 'make', 'body'].forEach(dimensions =>
  {
    yScales[dimensions] = d3.scalePoint()
      .domain(afterCleanData_Graph1.map(d => d[dimensions]).filter(Boolean))
      .range([height - margin.bottom, margin.top])
      .padding(0.1);
  });

  // Create the X axis, that's the distance between the vertical lines, the
  // data will connect between the lines
  const xScale = d3.scalePoint()
    .range([margin.left, width - margin.right])
    .domain(dimensions)
    .padding(0.2);
  /**
   * @brief The function `path` checks if all dimensions of a data point are
   * valid and returns the path if they are.
   * @param d - The `d` parameter in the `path` function represents a data
   * point that contains values for different dimensions. The function checks
   * if the data point is valid for all dimensions before returning a path
   * based on the data values.
   * @returns The function `path(d)` will return a path if all dimensions are
   * valid, otherwise it will return `null`. The path is generated using D3's
   * line generator and is based on the data point `d` provided as input.
   */
  function path(d)
  {
    // Check if any dimension returns NaN for this data point
    const valid = dimensions.every(p =>
    {
      const scaledValue = yScales[p](d[p]);
      return !isNaN(scaledValue);
    });
    // Only return path if all dimensions are valid
    return valid ? d3.line()(dimensions.map(p => [xScale(p), yScales[p]
      (d[p])])) : null;
  }

  // Show the lines.
  chartContainer_graph1.selectAll("path_connect_lines")
    .data(afterCleanData_Graph1)
    .enter().append("path")
    .attr("class", "path_lines")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", d => getColor(d.year))
    .style("opacity", 0.5)
    .style("stroke-width", 1.5);
  // Draw the lines for that vertical axis (Parallel Lines, each dimension a
  // line)
  chartContainer_graph1.selectAll("allAxies")
    .data(dimensions).enter()
    .append("g")
    .attr("transform", d => `translate(${ xScale(d) },0)`)
    .each(function (d)
    {
      d3.select(this).call(d3.axisLeft().scale(yScales[d]));
    })
    .attr("padding", 1)
    .style("font-size", 12)
    .style("font-weight", "bold")
    .call(g => g.selectAll("text")
      .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("stroke", "#e6ecf5")  // Changed to white for brighter appearance
      .attr("stroke-opacity", 0.5));

  // Make lables for each vertical line (i.e. year, make, model, body,
  // odometer, price)
  chartContainer_graph1.selectAll("dimension_labels")
    .data(dimensions).enter()
    .append("text")
    .text(d => d)
    .attr("text-anchor", "middle")
    .attr("x", d => xScale(d))
    .attr("y", height)
    .style("fill", "black")
    .style("font-size", 14)
    .style("text-decoration", "underline")
    .style("font-weight", "bold");

  /** Add a onClick event for the dimension, user can filter the lines by click the tick on the dimension */
  let lastClicked = { dimension: null, value: null };

  chartContainer_graph1.selectAll("g .tick text")
    .on("click", function (event, clickedValue)
    {
      // Get the dimension of the clicked tick
      const clickedDimension = d3.select(this.parentNode.parentNode).datum();

      // Check if the same tick was clicked again
      const isSameClick = lastClicked.dimension === clickedDimension && lastClicked.value === clickedValue;

      if (isSameClick)
      {
        // Reset to the default view
        chartContainer_graph1.selectAll(".path_lines")
          .style("stroke", d => getColor(d.year))
          .style("opacity", 0.5);
        lastClicked = { dimension: null, value: null };
      }
      else
      {
        const filteredData = afterCleanData_Graph1.filter(d =>
        {
          if (clickedDimension === "odometer" || clickedDimension === "price")
          {
            return d[clickedDimension] < clickedValue;
          }
          else
          {
            return d[clickedDimension] === clickedValue;
          }
        });
        // Update the opacity and color of the lines based on the filter
        chartContainer_graph1.selectAll(".path_lines")
          .style("stroke", lineData =>
            filteredData.includes(lineData) ? "steelblue" : "lightgray"
          )
          .style("opacity", lineData =>
            filteredData.includes(lineData) ? 1 : 0.1
          );

        // Update last clicked
        lastClicked = { dimension: clickedDimension, value: clickedValue };
      }
    });
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

/**
 * @brief The function `Graph2_data_cleaning` filters out non-luxury car brands from a dataset based on a predefined list of luxury brands.
 * @returns The function `Graph2_data_cleaning()` is returning an array of
 * objects where each object contains the `make` property from the
 * `column_from_csv` array after converting it to lowercase. The function
 * filters out any entries that do not belong to the luxury car brands listed
 * in the `luxuryBrands` array.
 */
function Graph2_data_cleaning()
{
  return column_from_csv.map(d =>
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
}

/**
 * @brief The function `Graph2_Detail` creates a pie chart based on car maker
 * data, grouping low percentage makers into 'Other' and displaying labels
 * and lines connecting slices.
 * @returns The `Graph2_Detail` function is setting up a pie chart
 * visualization based on car maker data.
 */
function Graph2_Detail()
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

  // Data preprocessing, group the data by car maker and count the number of
  // cars sold
  const carMakerCount = d3.rollup(Graph2_data_cleaning(), v => v.length,
    d => d.make);
  // Convert the Map to an array for pie chart
  const data = Array.from(carMakerCount, ([make, count]) =>
    ({ make, count }));

  // Merge the low percentage makers (percentage < 3) into 'Other'
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

  // Config the size of the pie
  const radius = Math.min(width, height) / 3;

  // Set up the color scale
  const color = d3.scaleOrdinal()
    .domain(filteredData.map(d => d.make))
    .range(d3.schemeCategory10);

  // Create the pie layout
  const pie = d3.pie()
    .value(d => d.count);

  // Create the arc generator
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // Bind data and create pie chart slices
  const arcs = chartContainer_graph2.selectAll(".arc")
    .data(pie(filteredData))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.make));

  // Create the arc for the labels
  const outerArc = d3.arc()
    .outerRadius(radius * 1.2)
    .innerRadius(radius * 1.2);

  // Create text labels outside the pie
  chartContainer_graph2.selectAll("text")
    .data(pie(filteredData))
    .enter()
    .append("text")
    .attr("transform", function (d)
    {
      const pos = outerArc.centroid(d);
      const mid = midAngle(d);
      // Adjust for left/right
      pos[0] = radius * (mid < Math.PI ? 1.3 : -1.3);

      // Adjust 'volkswagen' label manually
      if (d.data.make === "volkswagen")
      {
        pos[1] -= 20;  // Move up by 20 units
      }

      return `translate(${ pos })`;
    })
    .attr("text-anchor", function (d)
    {
      return (midAngle(d) < Math.PI ? "start" : "end");
    })
    .text(d =>
    {
      const percentage = ((d.data.count / total) * 100).toFixed(2);
      return `${ d.data.make } (${ percentage }%)`;
    });

  // Create the lines connecting slices to labels
  chartContainer_graph2.selectAll("polyline")
    .data(pie(filteredData))
    .enter()
    .append("polyline")
    .attr("points", function (d)
    {
      const pos = outerArc.centroid(d);
      const mid = midAngle(d);
      const outerPos = pos.slice();
      // Position of label
      outerPos[0] = radius * (mid < Math.PI ? 1.3 : -1.3);
      // Adjust 'volkswagen' polyline position manually other wise it would
      // collide
      if (d.data.make === "volkswagen")
      {
        outerPos[1] -= 20;  // Move line connection up by 20 units
      }
      return [arc.centroid(d), outerArc.centroid(d), outerPos];
    })
    .style("fill", "none")
    .style("stroke", "black");

  // MidAngle function for determining side of the pie
  function midAngle(d)
  {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

}



/** For the third chart, we would like to see the distribution of buyer's
 * choice based on years. To be more specific, we would like to see how many
 * cars were sold in each year. We will use a bar chart to demostrate this */
export function mountChart3()
{
  let Graph3Container = document.querySelector('#bar-container-graph3');
  chartObserver.observe(Graph3Container);
}

/**
 * @brief The function `Graph3_Detail` creates a bar chart using D3.js to
 * visualize the number of cars sold per year.
 */
function Graph3_Detail()
{
  // Set up SVG dimensions
  const margin = { top: 10, right: 10, bottom: 30, left: 60 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom - 60;

  let chartContainer_graph3 = d3.select('#Graph3')
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${ margin.left }, ${ margin.top })`);
  // Group data by year and count the number of cars for each year
  const carYearCount = d3.rollup(column_from_csv, v => v.length, d =>
    d.year);
  // Convert the Map to an array for bar chart
  const data = Array.from(carYearCount, ([year, count]) => ({
    year, count
  }));
  // Define color for the bars
  const colorScale = d3.scaleThreshold()
    .domain([10000, 50000, 100000])
    .range(['#ff0000', '#ffb700', '#d0ff00', '#0fd971']);

  function getColor(index)
  {
    return colorScale(index);
  }
  // Create the X scale
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.1);

  // Create the Y scale
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height, 0]);

  // Create the X axis
  chartContainer_graph3.append("g")
    .attr("transform", `translate(0, ${ height })`)
    .call(d3.axisBottom(xScale));

  // Create the Y axis
  chartContainer_graph3.append("g")
    .call(d3.axisLeft(yScale));

  // Create the bars
  chartContainer_graph3.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.count))
    .attr("fill", d => getColor(d.count));

  // Add the X axis label
  chartContainer_graph3.append("text")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .text("Year")
    .style("font-weight", "bold");

  // Add the Y axis label
  chartContainer_graph3.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .text("Number of car sold")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .style("font-weight", "bold");

}
