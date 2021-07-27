import "leaflet/dist/leaflet.css";
import "./styles.css";
import Leaflet from "leaflet";
import MandelbrotWorker from "./worker?worker"; // eslint-disable-line import/no-unresolved
import Pool from "./pool";
import { listPalettes } from "./palette";

// Create a pool of workers to send instructions to
const pool = Pool(MandelbrotWorker, navigator.hardwareConcurrency);

// Main Leaflet map object
const leaflet = Leaflet.map("leaflet", {
  attributionControl: false,
  crs: Leaflet.CRS.Simple,
  minZoom: 1, // Prevent zooming out too much
  maxZoom: 45, // Prevent running out of precision
});

// Custom Leaflet layer for rendering a custom plane
const RenderLayer = Leaflet.GridLayer.extend({
  initialize: function () {
    this.on("tileunload", (event) => {
      event.tile.cancel();
    });
  },
  createTile: function (coordinates, callback) {
    const pixelSize = this.getTileSize().x;
    const tile = document.createElement("canvas");
    tile.width = tile.height = pixelSize;
    const context = tile.getContext("2d");
    const image = context.createImageData(pixelSize, pixelSize);
    const realSize = 1 / Math.pow(2, coordinates.z - 1);

    tile.cancel = pool.addJob(
      {
        areSettings: false,
        image: image,
        real: coordinates.x * realSize,
        imaginary: -coordinates.y * realSize,
        size: realSize,
      },
      [image.data.buffer],
      (event) => {
        context.putImageData(event.data, 0, 0);
        callback(null, tile);
      }
    );

    return tile;
  },
});

// Add link to source code
const SourceText = Leaflet.Control.extend({
  options: {
    position: "bottomright",
  },
  onAdd: function () {
    const box = Leaflet.DomUtil.create(
      "div",
      "leaflet-control-layers leaflet-control-layers-expanded"
    );
    const link = document.createElement("a");
    link.innerHTML = "Source code";
    link.href = "https://github.com/ldobbelsteen/mandelbrot-viewer";
    Leaflet.DomEvent.disableClickPropagation(box);
    box.appendChild(link);
    return box;
  },
});

// Add settings/configuration/information menu
const SettingsMenu = Leaflet.Control.extend({
  options: {
    position: "bottomleft",
  },
  onAdd: function () {
    const box = Leaflet.DomUtil.create(
      "div",
      "leaflet-control-layers leaflet-control-layers-expanded settings-menu"
    );

    // Configure the maximum iterations of the Mandelbrot function
    const iterDiv = document.createElement("div");
    box.appendChild(iterDiv);
    const iterText = document.createElement("span");
    iterText.innerHTML = "Max iterations: ";
    iterDiv.appendChild(iterText);
    const iterInput = document.createElement("input");
    iterInput.type = "number";
    iterInput.value = 145;
    iterInput.min = 1;
    iterInput.step = 48;
    iterDiv.appendChild(iterInput);

    // Selector for the color palette
    const paletteDiv = document.createElement("div");
    box.appendChild(paletteDiv);
    const paletteText = document.createElement("span");
    paletteText.innerHTML = "Color palette: ";
    paletteDiv.appendChild(paletteText);
    const paletteInput = document.createElement("select");
    listPalettes().forEach((palette) => {
      const option = document.createElement("option");
      option.innerHTML = palette;
      paletteInput.appendChild(option);
    });
    paletteDiv.appendChild(paletteInput);

    // Configure the power to use in the Mandelbrot function
    const powerDiv = document.createElement("div");
    box.appendChild(powerDiv);
    const powerText = document.createElement("span");
    powerText.innerHTML = "Power: ";
    powerDiv.appendChild(powerText);
    const powerInput = document.createElement("input");
    powerInput.type = "number";
    powerInput.value = 2;
    powerDiv.appendChild(powerInput);

    // Reset the zoom level to the default level
    const zoomDiv = document.createElement("div");
    box.appendChild(zoomDiv);
    const zoomButton = document.createElement("button");
    zoomButton.innerHTML = "Reset zoom";
    const resetZoom = () => {
      leaflet.setView([0, 0], 1);
    };
    zoomButton.onclick = resetZoom;
    resetZoom();
    zoomDiv.appendChild(zoomButton);

    // Send the current settings to all of the workers
    function updateSettings() {
      pool.sendMessage({
        areSettings: true,
        maxIteration: parseInt(iterInput.value),
        palette: paletteInput.value,
        power: parseInt(powerInput.value),
      });
      pool.ready = true;
      leaflet.eachLayer((layer) => {
        layer.redraw();
      });
    }

    // Update settings on change of any of the inputs
    iterInput.onchange = updateSettings;
    paletteInput.onchange = updateSettings;
    powerInput.onchange = updateSettings;
    updateSettings();

    Leaflet.DomEvent.disableClickPropagation(box);
    return box;
  },
});

leaflet.addControl(new SettingsMenu());
leaflet.addControl(new SourceText());
leaflet.addLayer(new RenderLayer());
