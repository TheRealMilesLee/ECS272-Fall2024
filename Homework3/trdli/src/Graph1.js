import * as d3 from 'd3';
import { size } from './VisualizeLayout.js';
import { graph1_data_cleaning } from './graphDataCleaning.js';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

export function Graph1_Overall()
{
  const margin = { top: 20, right: 10, bottom: 30, left: 10 };
  const width = size.width - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;
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
  // Define color scales for each category with higher contrast
  const colorScales = {
    year: d3.scaleLinear().domain([0, d3.max(sankeyData.nodes.filter(d => d.name.startsWith('year-')), d => d.value)]).range(["#2d85c4", "#ae1aed"]),
    make: d3.scaleLinear().domain([0, d3.max(sankeyData.nodes.filter(d => d.name.startsWith('make-')), d => d.value)]).range(["#ae1aed", "#1ae843"]),
    body: d3.scaleLinear().domain([0, d3.max(sankeyData.nodes.filter(d => d.name.startsWith('body-')), d => d.value)]).range(["#1ae843", "#e38b19"]),
    odometer: d3.scaleLinear().domain([0, d3.max(sankeyData.nodes.filter(d => d.name.startsWith('odometer-')), d => d.value)]).range(["#e38b19", "#e64915"]),
    price: d3.scaleLinear().domain([0, d3.max(sankeyData.nodes.filter(d => d.name.startsWith('price-')), d => d.value)]).range(["#e64915", "#75250b"])
  };

  // Function to get color based on node name and value
  const getColor = (name, value) =>
  {
    const category = name.split('-')[0];
    return colorScales[category](value);
  };

  // Connect links
  svg.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(sankeyData.links)
    .enter()
    .append("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", d => getColor(d.source.name, d.value))
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
  // Add color legend
  const legend = svg.append("g")
    .attr("transform", `translate(0, ${ height + 10 })`);

  const legendData = [
    { category: 'year', color: colorScales.year(1) },
    { category: 'make', color: colorScales.make(1) },
    { category: 'body', color: colorScales.body(1) },
    { category: 'odometer', color: colorScales.odometer(1) },
    { category: 'price', color: colorScales.price(1) }
  ];

  const legendItem = legend.selectAll("g")
    .data(legendData)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${ i * 100 }, 0)`);

  legendItem.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", d => d.color);

  legendItem.append("text")
    .attr("x", 25)
    .attr("y", 10)
    .attr("dy", "0.35em")
    .style("font", "12px sans-serif")
    .text(d => d.category);

}
