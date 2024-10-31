import * as d3 from 'd3';
import { size } from "./VisualizeLayout.js";
import { column_from_csv } from './csvReadIn.js';

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
      const odometer = ranges(d.odometer || 0, Array.from({ length: 40 }, (_, i) => (i + 1) * 5000));
      const price = ranges(d.price || 0, Array.from({ length: 9 }, (_, i) => (i + 1) * 1000));
      if (price < 1000 || price > 30000) return null;  // Filter out entries with price 0 or less than 1000
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

/**
 * @brief Draws the overall view for Graph1 (Parallel Coordinates Chart).
 * @function Graph1_Overall
 * @returns {void}
 */
export function Graph1_Overall()
{
  // Set up the margins for the chart
  const margin = { top: 20, right: 5, bottom: 35, left: 5 };
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.top - margin.bottom - 15;
  const afterCleanData_Graph1 = graph1_data_cleaning();
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
  /** Add a reset button to clear all filters */
  const resetButton = d3.select("#parallel-coordinates-container-graph1")
    .append("button")
    .text("Reset Filters")
    .style("position", "absolute")
    .style("top", "10px")
    .style("right", "10px")
    .style("padding", "3px 7px")
    .style("background-color", "#f0f0f0")
    .style("border", "1px solid #ccc")
    .style("border-radius", "12px")
    .style("cursor", "pointer")
    .on("click", function ()
    {
      filters = {};
      chartContainer_graph1.selectAll(".path_lines")
        .style("stroke", d => getColor(d.year))
        .style("opacity", 0.5);
      chartContainer_graph1.selectAll("g .tick text")
        .style("fill", "black")
        .style("font-weight", "normal")
        .style("background-color", "#e6ecf5");  // reset the background color
    });

  /** Add a onClick event for the dimension, user can filter the lines by click the tick on the dimension */
  let filters = {};

  chartContainer_graph1.selectAll("g .tick text")
    .on("click", function (event, clickedValue)
    {
      const clickedDimension = d3.select(this.parentNode.parentNode).datum();
      const isSameClick = filters[clickedDimension] === clickedValue;

      if (isSameClick)
      {
        delete filters[clickedDimension];
        if (Object.keys(filters).length === 0)
        {
          chartContainer_graph1.selectAll(".path_lines")
            .style("stroke", d => getColor(d.year))
            .style("opacity", 0.5)
            .style("stroke-width", 1.5); // Reset stroke width
          chartContainer_graph1.selectAll("g .tick text")
            .style("fill", "black")
            .style("font-weight", "normal")
            .style("background-color", "#e6ecf5");  // reset the background color
        }
      } else
      {
        filters[clickedDimension] = clickedValue;
      }

      // Filter the data based on the selected filters
      const filteredData = afterCleanData_Graph1.filter(d =>
      {
        return Object.keys(filters).every(key =>
        {
          if (key === "odometer" || key === "price")
          {
            return d[key] < filters[key];
          } else
          {
            return d[key] === filters[key];
          }
        });
      });

      // reset the color and font weight of all ticks
      chartContainer_graph1.selectAll("g .tick text")
        .style("fill", "black")
        .style("font-weight", "normal")
        .style("background-color", "#e6ecf5");

      // get the ticks that need to be highlighted
      const highlightTicks = {
        year: new Set(filteredData.map(d => d.year)),
        make: new Set(filteredData.map(d => d.make)),
        body: new Set(filteredData.map(d => d.body)),
        odometer: new Set(filteredData.map(d => d.odometer)),
        price: new Set(filteredData.map(d => d.price))
      };

      // highlight the ticks that need to be highlighted
      chartContainer_graph1.selectAll("g .tick text")
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .filter(function (d)
        {
          const dimension = d3.select(this.parentNode.parentNode).datum();
          return highlightTicks[dimension] && highlightTicks[dimension].has(d);
        })
        .style("fill", "#781aeb")
        .style("font-weight", "bold")
        .style("font-size", 14);

      // update the lines connect the data points
      chartContainer_graph1.selectAll(".path_lines")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("stroke", lineData =>
          filteredData.includes(lineData) ? "#0384fc" : "#404d43"
        )
        .style("opacity", lineData =>
          filteredData.includes(lineData) ? 1 : 0.1
        )
        .style("stroke-width", lineData =>
          filteredData.includes(lineData) ? 3 : 1.5 // Make filtered lines thicker
        );
    });

  chartContainer_graph1.on("click", function (event)
  {
    if (!event.target.closest(".tick"))
    {
      filters = {};
      chartContainer_graph1.selectAll(".path_lines")
        .style("stroke", d => getColor(d.year))
        .style("opacity", 0.5);
      chartContainer_graph1.selectAll("g .tick text")
        .style("fill", "black")
        .style("font-weight", "normal")
        .style("background-color", "#e6ecf5");  // reset the background color
    }
  });
}
