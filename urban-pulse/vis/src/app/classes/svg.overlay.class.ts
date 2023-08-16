// import d3js
import * as d3 from "d3";

export class SvgOverlay extends google.maps.OverlayView {
  private map: google.maps.Map;
  private bounds: google.maps.LatLngBounds;
  private div: any;
  private data: any[];
  private latlngs: any[];
  private color: any;
  private size: number = 50; // size in meters

  constructor(map: google.maps.Map, color: any) {
    super();
    this.map = map;
    this.setMap(this.map);
    this.color = color;

    this.data = [];
    this.latlngs = [];
  }

  // returns meters per pixel at zoom level
  getScale(lat: number, zoom: number) {
    return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  }

  onAdd() {
    var that = this;

    this.div = document.createElement("div");
    this.div.style.borderStyle = "none";
    this.div.style.borderWidth = "0px";
    this.div.style.position = "absolute";

    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div);

    // make sure circles have uniform size on all zoom levels
    google.maps.event.addListener(this.map, "zoom_changed", function () {
      d3.select(that.div)
        .selectAll("circle")
        .attr("r", function (d: any) {
          let latlng = d.latLng;
          let scale = that.getScale(latlng[0], that.map.getZoom());
          return that.size / scale;
        })
        .attr("cx", function (d: any) {
          let latlng = d.latLng;
          let scale = that.getScale(latlng[0], that.map.getZoom());
          return (2 * that.size) / scale;
        })
        .attr("cy", function (d: any) {
          let latlng = d.latLng;
          let scale = that.getScale(latlng[0], that.map.getZoom());
          return (2 * that.size) / scale;
        });
    });
  }

  onRemove() {
    if (!this.map) return;

    this.div.parentNode.removeChild(this.div);
    this.data = [];
    this.latlngs = [];
  }

  setData(data: any) {
    if (typeof this.div !== "undefined") {
      this.div.parentNode.removeChild(this.div);
      this.div = document.createElement("div");
      this.div.style.borderStyle = "none";
      this.div.style.borderWidth = "0px";
      this.div.style.position = "absolute";

      var panes = this.getPanes();
      panes.overlayLayer.appendChild(this.div);
      // enables mouse events
      panes.overlayMouseTarget.appendChild(this.div);
    }
    this.data = data;
    this.latlngs = [];
    for (let i = 0; i < this.data.length; i++) {
      var id = this.data[i]["id"];

      // find center of bound
      let bound = new google.maps.LatLngBounds();
      for (let j = 0; j < this.data[i]["latLng"].length; j++) {
        let latlng = this.data[i]["latLng"][j];
        bound.extend(new google.maps.LatLng(latlng[0], latlng[1]));
      }
      let center = bound.getCenter();
      this.latlngs.push({
        id: id,
        latLng: [this.data[i]["latLng"][0], this.data[i]["latLng"][1]],
        name: this.data[i]["name"],
        ...this.data[i],
      });
    }
    this.draw();
  }

  getData() {
    return this.data;
  }

  highlight(sel: any) {
    if (!this.map || !this.div) return;

    // this scope
    var that = this;

    // has highlighted element
    var notDefined = typeof sel === "undefined";

    // gets the map div
    var map = d3.select(this.div);

    // highlight
    map.selectAll("circle").classed("highlight", function (d: any) {
      if (notDefined) return false;
      return sel.id === d.id;
    });
  }

  draw() {
    if (!this.map || !this.div) return;

    // this scope
    var that = this;
    // current projection
    let projection = this.getProjection();

    // lat lng to pixel
    function transform(d: any) {
      let latlng = d.latLng;
      let p = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(latlng[0], latlng[1])
      );

      let scale = that.getScale(latlng[0], that.map.getZoom());

      // console.log(this, d);

      return d3
        .select(this)
        .style("left", p.x - (2.0 * that.size) / scale + "px")
        .style("top", p.y - (2.0 * that.size) / scale + "px");
    }

    // let width = parseInt(d3.select(that).style("width"));
    // let height = parseInt(d3.select(that).style("height"));

    var Tooltip = d3
      .select(this.div)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    // Create the legend
    // Define the colors and labels for the legend
    var mouseover = function (d: any) {
      Tooltip.style("opacity", 1);
      d3.select(this).style("stroke", "black").style("opacity", 1);
    };

    var mousemove = function (d: any) {
      const conf = Number(d[`${d.type}_confidence`]).toFixed(3);
      var tableHtml = "<table>";
      tableHtml += "<tr><td>Business Name:</td><td>" + d.name + "</td></tr>";
      tableHtml += "<tr><td>Type:</td><td>" + d.type + "</td></tr>";
      tableHtml += "<tr><td>Confidence:</td><td>" + conf + "</td></tr>";
      tableHtml += "<tr><td>Categories:</td><td>" + d.categories + "</td></tr>";
      tableHtml += "</table>";

      Tooltip.html(tableHtml)
        .style("left", d3.mouse(this)[0] + "px")
        .style("top", d3.mouse(this)[1] + "px");
    };

    var mouseleave = function (d: any) {
      Tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };

    let marker = d3
      .select(this.div)
      .selectAll("svg")
      .data(this.latlngs)
      .each(transform)
      .enter()
      .append("svg")
      .each(transform)
      .attr("class", "marker")
      .style("width", "100px")
      .style("height", "100px")
      .style("position", "absolute")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    marker
      .append("circle")
      .attr("r", function (d: any) {
        let latlng = d.latLng;
        let scale = that.getScale(latlng[0], that.map.getZoom());
        return that.size / scale;
      })
      .attr("cx", function (d: any) {
        let latlng = d.latLng;
        let scale = that.getScale(latlng[0], that.map.getZoom());
        return (2 * that.size) / scale;
      })
      .attr("cy", function (d: any) {
        let latlng = d.latLng;
        let scale = that.getScale(latlng[0], that.map.getZoom());
        return (2 * that.size) / scale;
      })
      .style("fill", function (d: any) {
        const colorScale = (bColor: any) => {
          return d3
            .scaleLinear()
            .range(<any[]>["white", bColor])
            .domain([0, 100]);
        };
        // Family, Romantic, Professional,Friendship
        let colors = ["#0000A0", "#E55451", "#6A287E", "#3F9B0B"];
        if (d.type === "family")
          return colorScale(colors[0])(Number(d.family_confidence));
        if (d.type === "romantic")
          return colorScale(colors[1])(Number(d.romantic_confidence));
        if (d.type === "professional")
          return colorScale(colors[2])(Number(d.professional_confidence));
        if (d.type === "friendship")
          return colorScale(colors[3])(Number(d.friendship_confidence));
        return "#E55451";
      });
  }

  visibility(val: boolean) {
    this.div.style.visibility = val ? "visible" : "hidden";
  }
}
