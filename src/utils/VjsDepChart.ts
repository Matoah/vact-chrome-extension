//@ts-nocheck
import * as d3 from 'd3';

import Vjs from './Vjs';

const drag = (simulation: any) => {
  function dragstarted(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event: any, d: any) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

function linkArc(d: any) {
  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
  return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
}

const colorTypes = ["licensing", "suit", "resolved"];

function VjsDepChart(element: any, vjsList: Vjs[]) {
  const width = element.clientWidth,
    height = element.clientHeight;
  const links: Array<{ source: string; target: string; type: string }> = [];
  const nodes: Array<{ id: string; type: string }> = [];
  vjsList.forEach((vjs) => {
    const randomColor =
      colorTypes[Math.floor(Math.random() * colorTypes.length)];
    const vjsName = vjs.getName();
    nodes.push({ id: vjsName, type: randomColor });
    const deps = vjs.getDeps();
    if (deps && deps.length > 0) {
      deps.forEach((dep) => {
        links.push({
          source: vjsName,
          target: dep,
          type: randomColor,
        });
      });
    }
  });
  const types = Array.from(new Set(links.map((d) => d.type)));
  const color = d3.scaleOrdinal(types, d3.schemeCategory10);
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-400))
    .force("x", d3.forceX())
    .force("y", d3.forceY());
  const svg = d3
    .create("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("font", "12px sans-serif");
  svg
    .append("defs")
    .selectAll("marker")
    .data(types)
    .join("marker")
    .attr("id", (d) => `arrow-${d}`)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -0.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("fill", color)
    .attr("d", "M0,-5L10,0L0,5");

  const link = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("stroke", (d) => color(d.type))
    .attr(
      "marker-end",
      (d) => `url(${new URL(`#arrow-${d.type}`, window.location)})`
    );

  const node = svg
    .append("g")
    .attr("fill", "currentColor")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .call(drag(simulation));

  node
    .append("circle")
    .attr("stroke", (d) => color(d.type))
    .attr("stroke-width", 1.5)
    .attr("r", 4)
    .append('title')
    .html((d) => d.id);

  node
    .append("text")
    .attr("x", 8)
    .attr("y", "0.31em")
    .text((d) => d.id)
    .clone(true)
    .lower()
    .attr("fill", "none")
    .attr("stroke-width", 3);

  simulation.on("tick", () => {
    link.attr("d", linkArc);
    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });

  //invalidation.then(() => simulation.stop());

  element.innerHTML = "";
  element.appendChild(svg.node());
}

export default VjsDepChart;
