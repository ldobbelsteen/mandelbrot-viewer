import { getAlgorithm } from "./mandelbrot";
import { getPalette } from "./palette";

/**
 * Web worker that receives requests to render a region of the Mandelbrot set.
 * In order to do so, it first needs to once receive the settings of the set to
 * render. Afterwards an unlimited number of regions can be requested.
 * An ImageData object needs to be passed on to which the image will be
 * rendered. The size of the square region on the complex plane (width & height)
 * and the real and imaginary components of the top left point of the region
 * should also be passed. After rendering is finished, the ImageData is sent
 * back, without copying the data thanks to the Transferable API.
 */
onmessage = (event) => {
  if (event.data.areSettings) {
    settings(event.data.maxIteration, event.data.power, event.data.palette);
  } else {
    render(
      event.data.image,
      event.data.real,
      event.data.imaginary,
      event.data.size
    );
  }
};

let mandelbrot;
let palette;

function settings(maxIteration, power, paletteName) {
  mandelbrot = getAlgorithm(maxIteration, power);
  palette = getPalette(paletteName);
}

function render(imageData, leftCoordinate, topCoordinate, regionSize) {
  const imageSize = imageData.width;
  const scale = regionSize / imageData.width;

  let index = 0;
  let currentImaginary = topCoordinate;
  for (let y = 0; y < imageSize; y++) {
    let currentReal = leftCoordinate;
    for (let x = 0; x < imageSize; x++) {
      const fraction = mandelbrot(currentReal, currentImaginary);
      const rgb = palette(fraction);
      imageData.data[index++] = rgb[0];
      imageData.data[index++] = rgb[1];
      imageData.data[index++] = rgb[2];
      imageData.data[index++] = 255;
      currentReal += scale;
    }
    currentImaginary -= scale;
  }

  postMessage(imageData, [imageData.data.buffer]);
}
