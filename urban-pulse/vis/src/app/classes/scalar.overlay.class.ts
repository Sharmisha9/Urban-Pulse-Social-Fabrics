// import d3js
import * as d3 from 'd3';

export class ScalarOverlay extends google.maps.OverlayView {
  private map: google.maps.Map;
  private bounds: google.maps.LatLngBounds;
  private div: any;
  private img: any;
  private colorScale: any;
  legendDiv: HTMLDivElement;
  img1: HTMLImageElement;

  constructor(map: google.maps.Map, colorScale: any) {
    super();
    this.map = map;
    this.setMap(this.map);

    this.colorScale = colorScale;
  }

  onAdd() {
    this.div = document.createElement('div');
    this.div.style.borderStyle = 'none';
    this.div.style.borderWidth = '0px';
    this.div.style.position = 'absolute';

    this.legendDiv = document.createElement("div");
    this.div.style.borderStyle = "none";
    this.div.style.borderWidth = "0px";
    this.div.style.position = "absolute";

    var panes = this.getPanes();
    panes.overlayLayer.appendChild(this.div);
    panes.overlayLayer.appendChild(this.legendDiv);
  }

  onRemove() {
    if (!this.map) return;
    this.div.parentNode.removeChild(this.div);
  }

  setData(json: any) {
    this.bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(json["latLng"][0], json["latLng"][1]),
      new google.maps.LatLng(json["latLng"][2], json["latLng"][3])
    );

    // delete the old image
    if (typeof this.img !== "undefined")
      this.img.parentNode.removeChild(this.img);
    else {
      this.map.setCenter(this.bounds.getCenter());
      this.map.fitBounds(this.bounds);
    }

    let width = json["gridSize"][0];
    let height = json["gridSize"][1];
    let values = json["values"];
    let range = json["range"];
    let buffer = new Uint8ClampedArray(width * height * 4);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let posv = (height - y) * width + x;
        let posb = y * width + x;

        let val = (values[posv] - range[0]) / (range[1] - range[0]);
        val *= 20.0;
        let color = d3.rgb(this.colorScale(val));
        // console.log(val, color);

        buffer[4 * posb] = color.r;
        buffer[4 * posb + 1] = color.g;
        buffer[4 * posb + 2] = color.b;
        buffer[4 * posb + 3] = 255.0 * val;
      }
    }

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    let idata = ctx.createImageData(width, height);
    idata.data.set(buffer);
    ctx.putImageData(idata, 0, 0);


    let dataUri = canvas.toDataURL();
    this.img = document.createElement("img");
    this.img.src = dataUri;
    this.img.style.width = "100%";
    this.img.style.height = "100%";
    this.img.style.position = "absolute";

    this.addLegend();
    this.draw();
  }

  draw() {
    if (!this.map || !this.bounds || !this.div) return;
    if (this.img && !this.div.hasChildNodes()) {
      this.div.appendChild(this.img);
    }

    let projection = this.getProjection();

    let sw = projection.fromLatLngToDivPixel(this.bounds.getSouthWest());
    let ne = projection.fromLatLngToDivPixel(this.bounds.getNorthEast());
    this.div.style.left = sw.x + 'px';
    this.div.style.top = ne.y + 'px';
    this.div.style.width = ne.x - sw.x + 'px';
    this.div.style.height = sw.y - ne.y + 'px';
  }

  addLegend() {
    // Create a canvas element

    // Create a legend div and add it to the canvas
    const legend = document.createElement("div");
    legend.style.position = "absolute";
    legend.style.bottom = "20px";
    legend.style.left = "20px";
    legend.style.backgroundColor = "white";
    legend.style.padding = "10px";
    legend.style.border = "1px solid gray";
    legend.style.fontSize = "14px";

    // Create the container element
    const container = document.createElement("div");
    container.setAttribute("id", "container");

    // Create the first legend element
    const legend1 = document.createElement("div");
    legend1.setAttribute("id", "legend1");

    // Create the second legend element
    const legend1_text = document.createElement("div");
    legend1_text.setAttribute("id", "legend1_text");

    
    const legend2_text = document.createElement("div");
    legend2_text.setAttribute("id", "legend2_text");

    // Append the legend elements to the container element
    container.appendChild(legend1_text);
    container.appendChild(legend1);
    container.appendChild(legend2_text);

    // Define the base color
    const baseColor = "#0000A0";

    const minValue = 0;
    const maxValue = 100;
    const width = 150;
    const height = 20;
    const values = [0, 50, 100];

    const gradient = document.createElement("div");
    gradient.style.background = `linear-gradient(to right, white, ${baseColor})`;
    gradient.style.width = `${width}px`;
    gradient.style.height = `${height}px`;

    const colorBlocks = values.map((value) => {
      const color = d3.interpolateRgb("white", baseColor)(value / maxValue);
      const colorBlock = document.createElement("div");
      colorBlock.className = "legend1-color";
      colorBlock.style.background = color;
      return colorBlock;
    });

    const textLabels = values.map((value) => {
      const textLabel = document.createElement("div");
      textLabel.className = "legend1-text";
      textLabel.innerHTML = value.toString();
      return textLabel;
    });

    textLabels.forEach((textLabel) => legend1_text.appendChild(textLabel));
    legend1.appendChild(gradient);
    colorBlocks.forEach((colorBlock) => legend1.appendChild(colorBlock));
    legend2_text.appendChild(document.createTextNode("Confidence"));

    // Create legend items
    const romantic = document.createElement("div");
    romantic.className = "legend-item";
    romantic.style.display = "flex";
    romantic.style.alignItems = "center";
    const romanticColor = document.createElement("div");
    romanticColor.className = "legend-color";
    romanticColor.style.backgroundColor = "#E55451";
    romanticColor.style.width = "10px";
    romanticColor.style.height = "10px";
    romanticColor.style.marginRight = "5px";
    const romanticLabel = document.createTextNode("Romantic");
    romantic.appendChild(romanticColor);
    romantic.appendChild(romanticLabel);

    const family = document.createElement("div");
    family.className = "legend-item";
    family.style.display = "flex";
    family.style.alignItems = "center";
    const familyColor = document.createElement("div");
    familyColor.className = "legend-color";
    familyColor.style.backgroundColor = "#0000A0";
    familyColor.style.width = "10px";
    familyColor.style.height = "10px";
    familyColor.style.marginRight = "5px";
    const familyLabel = document.createTextNode("Family");
    family.appendChild(familyColor);
    family.appendChild(familyLabel);

    const friendship = document.createElement("div");
    friendship.className = "legend-item";
    friendship.style.display = "flex";
    friendship.style.alignItems = "center";
    const friendshipColor = document.createElement("div");
    friendshipColor.className = "legend-color";
    friendshipColor.style.backgroundColor = "#3F9B0B";
    friendshipColor.style.width = "10px";
    friendshipColor.style.height = "10px";
    friendshipColor.style.marginRight = "5px";
    const friendshipLabel = document.createTextNode("Friendship");
    friendship.appendChild(friendshipColor);
    friendship.appendChild(friendshipLabel);

    const professional = document.createElement("div");
    professional.className = "legend-item";
    professional.style.display = "flex";
    professional.style.alignItems = "center";
    const professionalColor = document.createElement("div");
    professionalColor.className = "legend-color";
    professionalColor.style.backgroundColor = "#6A287E";
    professionalColor.style.width = "10px";
    professionalColor.style.height = "10px";
    professionalColor.style.marginRight = "5px";
    const professionalLabel = document.createTextNode("Professional");
    professional.appendChild(professionalColor);
    professional.appendChild(professionalLabel);
    // Add legend items to the legend div
    legend.appendChild(container);
    legend.appendChild(family);
    legend.appendChild(romantic);
    legend.appendChild(friendship);
    legend.appendChild(professional);

    // Add the canvas and legend to the document body
    // document.body.appendChild(canvas1);
    document.body.appendChild(legend);
  }

  visibility(val: boolean) {
    this.div.style.visibility = val ? 'visible' : 'hidden';
  }
}
