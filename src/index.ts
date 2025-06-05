import "leaflet/dist/leaflet.css";
import "./styles.css";
import {
  CRS,
  Control,
  type Coords,
  DomEvent,
  DomUtil,
  type DoneCallback,
  GridLayer,
  type Layer,
  map,
} from "leaflet";
import { palettes } from "./palette";
import RenderPool from "./pool";

const pool = new RenderPool(navigator.hardwareConcurrency);

const leaflet = map("leaflet", {
  attributionControl: false, // Disable Leaflet link
  crs: CRS.Simple, // Use simple (x,y) coordinate system
  minZoom: 1, // Prevent zooming out too much
  maxZoom: 45, // Prevent running out of precision
});

class RenderLayer extends GridLayer {
  createTile(coords: Coords, done: DoneCallback) {
    const imageSize = this.getTileSize().x;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = imageSize;

    const context = canvas.getContext("2d");
    if (!context) {
      done(new Error("Failed to create canvas context"));
      return canvas;
    }

    const image = context.createImageData(imageSize, imageSize);
    const regionSize = 1 / 2 ** (coords.z - 1);

    canvas.oncancel = pool.addRender(
      {
        image,
        imageSize,
        regionTopLeftReal: coords.x * regionSize,
        regionTopLeftImaginary: -coords.y * regionSize,
        regionSize,
      },
      (image) => {
        context.putImageData(image, 0, 0);
        done(undefined, canvas);
      },
    );

    return canvas;
  }
}

class SourceText extends Control {
  constructor() {
    super();
    this.options.position = "bottomright";
  }

  onAdd() {
    const box = DomUtil.create(
      "div",
      "leaflet-control-layers leaflet-control-layers-expanded",
    );
    const link = document.createElement("a");
    link.innerHTML = "Source code";
    link.href = "https://github.com/ldobbelsteen/mandelbrot-viewer";
    DomEvent.disableClickPropagation(box);
    box.appendChild(link);
    return box;
  }
}

class SettingsMenu extends Control {
  constructor() {
    super();
    this.options.position = "bottomleft";
  }

  onAdd() {
    const box = DomUtil.create(
      "div",
      "leaflet-control-layers leaflet-control-layers-expanded settings-menu",
    );

    // Configure the maximum iterations of the Mandelbrot function
    const iterDiv = document.createElement("div");
    box.appendChild(iterDiv);
    const iterText = document.createElement("span");
    iterText.innerHTML = "Max iterations: ";
    iterDiv.appendChild(iterText);
    const iterInput = document.createElement("input");
    iterInput.type = "number";
    iterInput.value = "145";
    iterInput.min = "1";
    iterInput.step = "48";
    iterInput.title = "Iterations";
    iterDiv.appendChild(iterInput);

    // Selector for the color palette
    const paletteDiv = document.createElement("div");
    box.appendChild(paletteDiv);
    const paletteText = document.createElement("span");
    paletteText.innerHTML = "Color palette: ";
    paletteDiv.appendChild(paletteText);
    const paletteInput = document.createElement("select");
    for (const palette of Object.keys(palettes)) {
      const option = document.createElement("option");
      option.innerHTML = palette;
      paletteInput.appendChild(option);
    }
    paletteDiv.appendChild(paletteInput);

    // Configure the power to use in the Mandelbrot function
    const powerDiv = document.createElement("div");
    box.appendChild(powerDiv);
    const powerText = document.createElement("span");
    powerText.innerHTML = "Power: ";
    powerDiv.appendChild(powerText);
    const powerInput = document.createElement("input");
    powerInput.type = "number";
    powerInput.value = "2";
    powerInput.title = "Power";
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
      pool.broadcastSettings({
        maxIterations: Number.parseInt(iterInput.value),
        paletteName: paletteInput.value,
        mandelbrotPower: Number.parseInt(powerInput.value),
      });
      leaflet.eachLayer((layer: Layer) => {
        (layer as RenderLayer).redraw();
      });
    }

    // Update settings on change of any of the inputs
    iterInput.onchange = updateSettings;
    paletteInput.onchange = updateSettings;
    powerInput.onchange = updateSettings;
    updateSettings();

    DomEvent.disableClickPropagation(box);
    return box;
  }
}

leaflet.addControl(new SettingsMenu());
leaflet.addControl(new SourceText());
leaflet.addLayer(new RenderLayer());
