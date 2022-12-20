//@ts-nocheck
import * as d3 from "d3";

import initTip from "./D3Tip";

function withCustom(defaultClass) {
  return (d) =>
    d.customClass ? [d.customClass, defaultClass].join(" ") : defaultClass;
}
class TimelineChart {
  static TYPE = {
    POINT: "POINT",
    INTERVAL: "INTERVAL",
  };
  constructor(
    element: any,
    data: Array<{ label: string; data: any }>,
    options
  ) {
    element.classList.add("timeline-chart");
    let allElements = data.reduce((agg, e) => agg.concat(e.data), []);
    let minDt = d3.min(allElements, this.getPointMinDt);
    let maxDt = d3.max(allElements, this.getPointMaxDt);
    let elementWidth = element.clientWidth;
    let elementHeight = element.clientHeight;
    let margin = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 0,
    };
    let groupWidth = 200;
    let width = elementWidth - margin.left - margin.right;
    let height = elementHeight - margin.top - margin.bottom;
    let groupHeight = height / data.length;
    const x = d3.scaleTime().domain([minDt, maxDt]).range([0, width]);
    const xAxis = (g, x) =>
      g
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(-height));
    const zoom = d3.zoom().on("zoom", function ({ transform }) {
      gx.call(xAxis, transform.rescaleX(x));
      console.log(transform);

      svg
        .selectAll("rect.interval")
        .attr("transform", function () {
          const { y } = this.getBBox();
          return (
            "translate(" +
            transform.x +
            "," +
            8 / transform.y +
            ") scale(" +
            transform.k +
            ")"
          );
        })
        .attr("style", function () {
          const { height } = this.getBBox();
          return `height:${20 / transform.k}px`;
        });
    });
    const svg = d3
      .select(element)
      .append("svg")
      .attr("viewBox", [0, 0, elementWidth, elementHeight]);
    svg
      .selectAll(".group-section")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "group-section")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d, i) => {
        return groupHeight * (i + 1);
      })
      .attr("y2", (d, i) => {
        return groupHeight * (i + 1);
      });
    svg
      .selectAll(".group-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "group-label")
      .attr("fill", "currentColor")
      .attr("x", 0)
      .attr("y", (d, i) => {
        return groupHeight * i + groupHeight / 2 + 5.5;
      })
      .attr("dx", "0.5em")
      .text((d) => d.label);

    let groupIntervalItems = svg
      .selectAll(".group-interval-item")
      .data(data)
      .enter()
      .append("g")
      .attr("clip-path", "url(#chart-content)")
      .attr("transform", (d, i) => `translate(0, ${groupHeight * i})`)
      .selectAll(".dot")
      .data((d) => d.data.filter((_) => _.type === TimelineChart.TYPE.INTERVAL))
      .enter();

    //let intervalBarHeight = 0.8 * groupHeight;
    let intervalBarMargin = (groupHeight - 20) / 2;
    let intervals = groupIntervalItems
      .append("rect")
      .attr("class", withCustom("interval"))
      .attr("width", (d) =>
        Math.max(options.intervalMinWidth, x(d.to) - x(d.from))
      )
      //.attr("height", intervalBarHeight)
      .attr("y", intervalBarMargin)
      .attr("x", (d) => x(d.from));

    groupIntervalItems
      .append("text")
      .text((d) => d.label)
      .attr("fill", "white")
      .attr("class", withCustom("interval-text"))
      .attr("y", groupHeight / 2 + 5)
      .attr("x", (d) => x(d.from));
    const gx = svg.append("g").attr("test", "test");
    svg.call(zoom);
    var tip = initTip().attr("class", "d3-tip").html(options.tip);
    svg.call(tip);
    intervals.on("mouseover", tip.show).on("mouseout", tip.hide);
    var func = options.dblclick,
      hideFn = tip ? tip.hide : null;
    if (func) {
      intervals.on("dblclick", function () {
        if (hideFn) {
          hideFn();
        }
        func.apply(this, arguments);
      });
    }
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  }
  getPointMinDt(p) {
    return p.type === TimelineChart.TYPE.POINT ? p.at : p.from;
  }
  getPointMaxDt(p) {
    return p.type === TimelineChart.TYPE.POINT ? p.at : p.to;
  }
}

export default TimelineChart;
