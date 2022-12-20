//@ts-nocheck
import * as d3 from 'd3';

import initTip from './D3Tip';

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
    let self = this;
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
    let x = d3.scaleTime().domain([minDt, maxDt]).range([groupWidth, width]);

    let xAxis = d3.axisBottom(x).tickSize(-height);
    let zoom = d3.zoom().on("zoom", zoomed);

    const svg = d3
      .select(element)
      .append("svg")
      .attr("width", elementWidth)
      .attr("height", elementHeight)
      .append("g")
      .attr("class", "view")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    svg
      .append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    let groupHeight = height / data.length;
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

    svg
      .append("line")
      .attr("x1", groupWidth)
      .attr("x2", groupWidth)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "black");

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

    let intervalBarHeight = 0.8 * groupHeight;
    let intervalBarMargin = (groupHeight - intervalBarHeight) / 2;
    let intervals = groupIntervalItems
      .append("rect")
      .attr("class", withCustom("interval"))
      .attr("width", (d) => Math.max(8, x(d.to) - x(d.from)))
      .attr("height", intervalBarHeight)
      .attr("y", intervalBarMargin)
      .attr("x", (d) => x(d.from));

    groupIntervalItems
      .append("text")
      .text((d) => d.label)
      .attr("fill", "white")
      .attr("class", withCustom("interval-text"))
      .attr("y", groupHeight / 2 + 5)
      .attr("x", (d) => x(d.from));

    let groupDotItems = svg
      .selectAll(".group-dot-item")
      .data(data)
      .enter()
      .append("g")
      .attr("clip-path", "url(#chart-content)")
      .attr("class", "item")
      .attr("transform", (d, i) => `translate(0, ${groupHeight * i})`)
      .selectAll(".dot")
      .data((d) => {
        return d.data.filter((_) => _.type === TimelineChart.TYPE.POINT);
      })
      .enter();

    groupDotItems
      .append("circle")
      .attr("class", withCustom("dot"))
      .attr("cx", (d) => x(d.at))
      .attr("cy", groupHeight / 2)
      .attr("r", 5);

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

    function withCustom(defaultClass) {
      return (d) =>
        d.customClass ? [d.customClass, defaultClass].join(" ") : defaultClass;
    }

    function zoomed({ transform }) {
      if (self.onVizChangeFn && d3.event) {
        self.onVizChangeFn.call(self, {
          scale: d3.event.scale,
          translate: d3.event.translate,
          domain: x.domain(),
        });
      }

      if (options.enableLiveTimer) {
        updateNowMarker();
      }
      svg.attr("transform", transform);
      gx.call(xAxis, transform.rescaleX(x));
      //svg.select(".x.axis").call(xAxis);

      /*svg.selectAll("circle.dot").attr("cx", (d) => x(d.at));
      svg
        .selectAll("rect.interval")
        .attr("x", (d) => x(d.from))
        .attr("width", (d) =>
          Math.max(options.intervalMinWidth, x(d.to) - x(d.from))
        );

      svg
        .selectAll(".interval-text")
        .attr("x", function (d) {
          let positionData = getTextPositionData.call(this, d);
          if (
            positionData.upToPosition - groupWidth - 10 <
            positionData.textWidth
          ) {
            return positionData.upToPosition;
          } else if (
            positionData.xPosition < groupWidth &&
            positionData.upToPosition > groupWidth
          ) {
            return groupWidth;
          }
          return positionData.xPosition;
        })
        .attr("text-anchor", function (d) {
          let positionData = getTextPositionData.call(this, d);
          if (
            positionData.upToPosition - groupWidth - 10 <
            positionData.textWidth
          ) {
            return "end";
          }
          return "start";
        })
        .attr("dx", function (d) {
          let positionData = getTextPositionData.call(this, d);
          if (
            positionData.upToPosition - groupWidth - 10 <
            positionData.textWidth
          ) {
            return "-0.5em";
          }
          return "0.5em";
        })
        .text(function (d) {
          var positionData = getTextPositionData.call(this, d);
          var percent =
            (positionData.width - options.textTruncateThreshold) /
            positionData.textWidth;
          if (percent < 1) {
            if (positionData.width > options.textTruncateThreshold) {
              return (
                d.label.substr(0, Math.floor(d.label.length * percent)) + "..."
              );
            } else {
              return "";
            }
          }

          return d.label;
        });

      function getTextPositionData(d) {
        this.textSizeInPx = this.textSizeInPx || this.getComputedTextLength();
        var from = x(d.from);
        var to = x(d.to);
        return {
          xPosition: from,
          upToPosition: to,
          width: to - from,
          textWidth: this.textSizeInPx,
        };
      }*/
    }
  }
  getPointMinDt(p) {
    return p.type === TimelineChart.TYPE.POINT ? p.at : p.from;
  }
  getPointMaxDt(p) {
    return p.type === TimelineChart.TYPE.POINT ? p.at : p.to;
  }
}

export default TimelineChart;
