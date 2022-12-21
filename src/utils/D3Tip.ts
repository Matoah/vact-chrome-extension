//@ts-nocheck
//源码来自d3-tip插件
import { map } from 'd3-collection';
import {
  select,
  selectAll,
  selection,
} from 'd3-selection';

function D3Tip() {
  let direction = d3TipDirection,
    offset = d3TipOffset,
    html = d3TipHTML;
  let rootElement = document.body,
    svg = null,
    point = null,
    target = null,
    node = initNode();
  function clear() {
    selectAll(".d3-tip").remove();
  }

  clear();
  function tip(vis) {
    svg = getSVGNode(vis);
    if (!svg) return;
    point = svg.createSVGPoint();
    rootElement.appendChild(node);
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function () {
    var args = Array.prototype.slice.call(arguments);
    if (args[args.length - 1] instanceof SVGElement) target = args.pop();

    var content = html.apply(this, args),
      poffset = offset.apply(this, args),
      dir = direction.apply(this, args),
      nodel = getNodeEl(),
      i = directions.length,
      coords,
      scrollTop = document.documentElement.scrollTop || rootElement.scrollTop,
      scrollLeft =
        document.documentElement.scrollLeft || rootElement.scrollLeft;

    nodel.html(content).style("opacity", 1).style("pointer-events", "all");

    while (i--) nodel.classed(directions[i], false);
    coords = directionCallbacks.get(dir).apply(this);
    var left = coords.left + poffset[1] + scrollLeft;
    var clientX = event.clientX;
    var arrawLeft = clientX - left - 5;
    if (arrawLeft < 0) {
      arrawLeft = 5;
      left = left - arrawLeft;
    } else if (arrawLeft > left + node.offsetWidth) {
      left = arrawLeft - node.offsetWidth;
    }
    nodel
      .classed(coords.direction, true)
      .style("top", coords.top + poffset[0] + scrollTop + "px")
      .style("left", left + "px")
      .selectAll(".icon-arrow")
      .style("left", arrawLeft + "px");

    return tip;
  };

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function () {
    var nodel = getNodeEl();
    nodel.style("opacity", 0).style("pointer-events", "none");
    return tip;
  };

  // Public: Proxy attr calls to the d3 tip container.
  // Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  // eslint-disable-next-line no-unused-vars
  tip.attr = function (n, v) {
    if (arguments.length < 2 && typeof n === "string") {
      return getNodeEl().attr(n);
    }

    var args = Array.prototype.slice.call(arguments);
    selection.prototype.attr.apply(getNodeEl(), args);
    return tip;
  };

  // Public: Proxy style calls to the d3 tip container.
  // Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  // eslint-disable-next-line no-unused-vars
  tip.style = function (n, v) {
    if (arguments.length < 2 && typeof n === "string") {
      return getNodeEl().style(n);
    }

    var args = Array.prototype.slice.call(arguments);
    selection.prototype.style.apply(getNodeEl(), args);
    return tip;
  };

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function (v) {
    if (!arguments.length) return direction;
    direction = v == null ? v : functor(v);

    return tip;
  };

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function (...args: any[]) {
    if (!arguments.length) return offset;
    const v = args[0];
    offset = v == null ? v : functor(v);

    return tip;
  };

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function (...args: any[]) {
    if (!args.length) return html;
    const v = args[0];
    html = v == null ? v : functor(v);

    return tip;
  };

  // Public: sets or gets the root element anchor of the tooltip
  //
  // v - root element of the tooltip
  //
  // Returns root node of tip
  tip.rootElement = function (...args: any[]) {
    if (!arguments.length) return rootElement;
    const v = args[0];
    rootElement = v == null ? v : functor(v);

    return tip;
  };

  // Public: destroys the tooltip and removes it from the DOM
  //
  // Returns a tip
  tip.destroy = function () {
    if (node) {
      getNodeEl().remove();
      node = null;
    }
    return tip;
  };

  function d3TipDirection() {
    return "auto";
  }
  function d3TipOffset() {
    return [0, 0];
  }
  function d3TipHTML() {
    return " ";
  }

  var directionCallbacks = map({
      n: directionNorth,
      s: directionSouth,
      e: directionEast,
      w: directionWest,
      nw: directionNorthWest,
      ne: directionNorthEast,
      sw: directionSouthWest,
      se: directionSouthEast,
      auto: directionAuto,
    }),
    directions = directionCallbacks.keys();
  function directionAuto() {
    const bodyWidth = document.body.clientWidth;
    const bbox = getScreenBBox(this);
    const target = event?.target;
    const targetWidth = bbox.ne.x - bbox.nw.x;
    const targetHeight = bbox.s.y - bbox.n.y;
    const tipPanelWidth = node?.offsetWidth;
    const tipPanelHeight = node?.offsetHeight;
    const pointLeft = event.clientX;
    let direction = "n",
      top = 0,
      left = pointLeft - tipPanelWidth / 2;
    if (left < 0) {
      left = 0;
    } else if (left + tipPanelWidth > bodyWidth) {
      left = bodyWidth - tipPanelWidth;
    }
    if (bbox.n.y > tipPanelHeight) {
      top = bbox.n.y - tipPanelHeight - 5;
    } else {
      direction = "s";
      top = bbox.se.y + targetHeight - 3;
    }
    return {
      left,
      top,
      direction,
    };
    /*const directions = [
      { fn: directionNorth, offsetTop: -5, offsetLeft: 0, direction: "n" },
      { fn: directionSouth, offsetTop: 20, offsetLeft: 0, direction: "s" },
    ];
    var def = null;
    for (var i = 0, l = directions.length; i < l; i++) {
      var direction = directions[i];
      var func = direction.fn;
      var rs = func.apply(this, []);
      rs = {
        top: rs.top + direction?.offsetTop,
        left: rs.left + direction?.offsetLeft,
        direction: direction.direction,
      };
      if (def == null) {
        def = rs;
      }
      if (rs.top > 0 && rs.left > 0) {
        if (rs.left + node?.offsetWidth > bodyWidth) {
          rs.left = bodyWidth - node?.offsetWidth;
        }
        if (rs.top + node?.offsetHeight > bodyHeight) {
          rs.top = bodyHeight - node?.offsetHeight;
        }
        return rs;
      }
    }
    return def;*/
  }

  function directionNorth() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2,
    };
  }

  function directionSouth() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2,
    };
  }

  function directionEast() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x,
    };
  }

  function directionWest() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth,
    };
  }

  function directionNorthWest() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth,
    };
  }

  function directionNorthEast() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x,
    };
  }

  function directionSouthWest() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth,
    };
  }

  function directionSouthEast() {
    var bbox = getScreenBBox(this);
    return {
      top: bbox.se.y,
      left: bbox.se.x,
    };
  }

  function initNode() {
    var div = select(document.createElement("div"));
    div
      .style("position", "absolute")
      .style("top", 0)
      .style("opacity", 0)
      .style("pointer-events", "none")
      .style("box-sizing", "border-box");

    return div.node();
  }

  function getSVGNode(element) {
    var svgNode = element.node();
    if (!svgNode) return null;
    if (svgNode.tagName.toLowerCase() === "svg") return svgNode;
    return svgNode.ownerSVGElement;
  }

  function getNodeEl() {
    if (node == null) {
      node = initNode();
      // re-add node to DOM
      rootElement.appendChild(node);
    }
    return select(node);
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast),
  // nw(northwest), sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox(targetShape) {
    var targetel = target || targetShape;

    while (targetel.getScreenCTM == null && targetel.parentNode != null) {
      targetel = targetel.parentNode;
    }

    var bbox = {},
      matrix = targetel.getScreenCTM(),
      tbbox = targetel.getBBox(),
      width = tbbox.width,
      height = tbbox.height,
      x = tbbox.x,
      y = tbbox.y;

    point.x = x;
    point.y = y;
    bbox.nw = point.matrixTransform(matrix);
    point.x += width;
    bbox.ne = point.matrixTransform(matrix);
    point.y += height;
    bbox.se = point.matrixTransform(matrix);
    point.x -= width;
    bbox.sw = point.matrixTransform(matrix);
    point.y -= height / 2;
    bbox.w = point.matrixTransform(matrix);
    point.x += width;
    bbox.e = point.matrixTransform(matrix);
    point.x -= width / 2;
    point.y -= height / 2;
    bbox.n = point.matrixTransform(matrix);
    point.y += height;
    bbox.s = point.matrixTransform(matrix);

    return bbox;
  }

  // Private - replace D3JS 3.X d3.functor() function
  function functor(v) {
    return typeof v === "function"
      ? v
      : function () {
          return v;
        };
  }

  return tip;
}

export default D3Tip;
