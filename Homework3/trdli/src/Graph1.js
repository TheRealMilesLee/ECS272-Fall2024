import * as d3 from 'd3';
import { size } from './VisualizeLayout.js';
import { column_from_csv } from './csvReadIn.js';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

function graph1_data_cleaning()
{
  const yearRanges = [
    { start: 1980, end: 1985, label: '1980-1985' },
    { start: 1986, end: 1990, label: '1986-1990' },
    { start: 1991, end: 1995, label: '1991-1995' },
    { start: 1996, end: 2000, label: '1996-2000' },
    { start: 2001, end: 2005, label: '2001-2005' },
    { start: 2006, end: 2010, label: '2006-2010' },
    { start: 2011, end: 2015, label: '2011-2015' },
    { start: 2016, end: 2020, label: '2016-2020' },
    { start: 2021, end: 2025, label: '2021-2025' }
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

  // Make categories
  function getMakeCategory(make)
  {
    const JapaneseMakes = ['toyota', 'isuzu', 'honda', 'nissan', 'subaru', 'mazda', 'iszuzu', 'mitsubishi', 'suzuki', 'daihatsu', 'lexus', 'infiniti', 'acura', 'scion'];
    const EuropeanMakes = ['volkswagen', 'geo', 'rolls-royce', 'fisker', 'audi', 'bmw', 'mercedes-benz', 'porsche', 'volvo', 'saab', 'fiat', 'alfa', 'jaguar', 'land rover', 'mini', 'smart', 'bentley', 'rolls royce', 'aston martin', 'lotus', 'maserati', 'lamborghini', 'ferrari'];
    const AmericanMakes = ['ford', 'ram', 'chevrolet', 'dodge', 'jeep', 'chrysler', 'cadillac', 'lincoln', 'buick', 'gmc', 'plymouth', 'saturn', 'pontiac', 'oldsmobile', 'mercury', 'hummer', 'tesla'];
    const KoreanMakes = ['hyundai', 'kia', 'genesis', 'daewoo', 'ssangyong'];

    if (JapaneseMakes.includes(make)) return 'Japanese';
    if (EuropeanMakes.includes(make)) return 'European';
    if (AmericanMakes.includes(make)) return 'American';
    if (KoreanMakes.includes(make)) return 'Korean';
    return 'Other';
  }
  const categoriesMake = (make) =>
  {
    if (!make) return 'Unknown';
    return getMakeCategory(make.toLowerCase());
  };

  // Body categories
  const categorizeBody = (body) =>
  {
    if (!body) return 'Unknown';
    const bodyLower = body.toLowerCase();
    const categories = ['coupe', 'sedan', 'suv', 'minivan', 'truck', 'van', 'wagon', 'hatchback', 'convertible', 'roadster', 'cab'];

    if (bodyLower.includes('koup')) return 'coupe';
    if (bodyLower.includes('navitgation')) return 'suv';
    if (bodyLower.includes('supercrew')) return 'truck';

    return categories.find(category => bodyLower.includes(category)) || 'Other';
  };

  // Odometer categories
  const odometerRanges = [
    { start: 0, end: 1000, label: '0-1000' },
    { start: 1001, end: 5000, label: '1001-5000' },
    { start: 5001, end: 10000, label: '5001-10000' },
    { start: 10001, end: 50000, label: '10001-50000' },
    { start: 50001, end: 100000, label: '50001-100000' },
    { start: 100001, end: 150000, label: '100001-150000' },
    { start: 150001, end: 200000, label: '150001-200000' },
    { start: 200001, end: 250000, label: '200001-250000' },
    { start: 250001, end: 300000, label: '250001-300000' },
    { start: 300001, end: 350000, label: '300001-350000' }
  ];
  const categoriesOdometer = (odometer) =>
  {
    if (!odometer) return 'Unknown';
    // Make odometer into the ranges
    const odometerNum = parseInt(odometer);
    if (isNaN(odometerNum))
    {
      return 'Unknown';
    }
    else
    {
      for (const range of odometerRanges)
      {
        if (odometerNum >= range.start && odometerNum <= range.end)
        {
          return range.label;
        }
        else if (odometerNum > 350000)
        {
          return '350001-above';
        }
      }
    }
  };

  // Price categories
  const priceRanges = [
    { start: 0, end: 1000, label: '0-1000' },
    { start: 1001, end: 5000, label: '1001-5000' },
    { start: 5001, end: 10000, label: '5001-10000' },
    { start: 10001, end: 20000, label: '10001-20000' },
    { start: 20001, end: 30000, label: '20001-30000' },
    { start: 30001, end: 40000, label: '30001-40000' },
    { start: 40001, end: 50000, label: '40001-50000' },
  ];
  const categoriesPrice = (price) =>
  {
    if (!price) return 'Unknown';
    const priceNum = parseInt(price);
    if (isNaN(priceNum))
    {
      return 'Unknown';
    }
    else
    {
      for (const range of priceRanges)
      {
        if (priceNum >= range.start && priceNum <= range.end)
        {
          return range.label;
        }
        else if (priceNum > 50000)
        {
          return '50001-above';
        }
      }
    }
  };

  const uniqueEntries = new Set();
  return column_from_csv.map(d =>
  {
    const year = categorizeYear(d.year);
    const make = categoriesMake(d.make);
    const body = categorizeBody(d.body);
    const odometer = categoriesOdometer(d.odometer);
    const price = categoriesPrice(d.price);
    const uniqueKey = `${ year }-${ make }-${ body }`;
    if (!uniqueEntries.has(uniqueKey))
    {
      uniqueEntries.add(uniqueKey);
      return {
        year: year,
        make: make,
        body: body,
        odometer: odometer,
        price: price
      };
    }
    return null;
  }).filter(d => d !== null);  // Filter out null entries
}

export function Graph1_Overall()
{
  const margin = { top: 20, right: 10, bottom: 30, left: 10 };
  const width = size.width - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;
  const afterCleanData_Graph1 = graph1_data_cleaning();
  d3.sort(afterCleanData_Graph1, d => d.year);

  if (afterCleanData_Graph1.length === 0)
  {
    console.error('No data available for visualization');
    return;
  }

  // Initialize nodes and links and prepare the categories for the sankey diagram
  const nodes = [];
  const links = [];
  const categories = ['year', 'make', 'body', 'odometer', 'price'];
  const nodeMap = new Map();

  // Create nodes for each category
  categories.forEach(category =>
  {
    const uniqueValues = new Set(afterCleanData_Graph1.map(d => d[category]));
    uniqueValues.forEach(value =>
    {
      const nodeName = `${ category }-${ value }`;
      if (!nodeMap.has(nodeName))
      {
        nodeMap.set(nodeName, nodes.length);
        nodes.push({ name: nodeName });
      }
    });
  });


  // Create links between nodes
  afterCleanData_Graph1.forEach(d =>
  {
    for (let i = 0; i < categories.length - 1; i++)
    {
      const sourceName = `${ categories[i] }-${ d[categories[i]] }`;
      const targetName = `${ categories[i + 1] }-${ d[categories[i + 1]] }`;

      const sourceIndex = nodeMap.get(sourceName);
      const targetIndex = nodeMap.get(targetName);

      if (sourceIndex !== undefined && targetIndex !== undefined)
      {
        links.push({
          source: sourceIndex,
          target: targetIndex,
          value: 1
        });
      }
    }
  });


  // Create sankey diagram
  const sankeyDiagram = sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 5]])
    .nodeSort((a, b) =>
    {
      // 按列进行条件排序
      if (a.layer === 1 || a.layer === 4 || a.layer === 5)
      {
        return d3.ascending(a.value, b.value); // 第1, 4, 5竖列按数字升序排序
      }
      return null; // 其他列保留默认顺序
    });

  // Create sankey data
  const sankeyData = sankeyDiagram({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });

  // Create SVG
  const svg = d3.select("#Graph1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${ margin.left },${ margin.top })`);

  // create color for each category based on year, make, body, odometer, price
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // connect links
  svg.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(sankeyData.links)
    .enter()
    .append("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", d => color(d.source.name.split('-')[0]))  // Apply color based on category
    .attr("stroke-width", d => Math.max(1, d.width))
    .style("opacity", 0.6);

  // add nodes
  const nodeGroup = svg.append("g");

  // add node rectangles
  const nodeRects = nodeGroup.selectAll("rect")
    .data(sankeyData.nodes)
    .enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => d3.scaleOrdinal(d3.schemeCategory10)(d.name))
    .attr("stroke", "#000");

  // Add node labels
  nodeGroup.append("g")
    .style("font", "12px sans-serif")
    .selectAll("text")
    .data(sankeyData.nodes)
    .enter()
    .append("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .text(d =>
    {
      if (d.name.split('-')[2] !== undefined)
      {
        return d.name.split('-')[1] + '-' + d.name.split('-')[2];
      }
      else
      {
        return d.name.split('-')[1];
      }
    })
    .attr("stroke", "#000");

  // Add legend
  nodeGroup.selectAll("rect")
    .append("title")
    .text(d => d.name.split('-')[1])
    .attr("fill", d => d3.scaleOrdinal(d3.schemeCategory10)(d.name.split('-')[0]))
    .attr("stroke", "#000");
}
