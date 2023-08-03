import { getAlgorithm } from "../algorithm";
import { Palette, palettes } from "../palette";
import { Algorithm } from "../algorithm";

export interface RenderInstruction {
  image: ImageData;
  imageSize: number;
  regionTopLeftReal: number;
  regionTopLeftImaginary: number;
  regionSize: number;
}

export interface RenderSettings {
  mandelbrotPower: number;
  maxIterations: number;
  paletteName: string;
}

let algorithm: Algorithm;
let palette: Palette;

/**
 * Web Worker that executes requests to render a region of the Mandelbrot set.
 * It can receive and store a set of settings at any time to customize the
 * rendering, which has to happen before any rendering can take place. After,
 * this worker can render a region of the Mandelbrot set onto an ImageData
 * object. This ImageData object will be posted back using the Transferable API
 * to prevent copying.
 */
onmessage = (event: MessageEvent<RenderInstruction | RenderSettings>) => {
  if ("maxIterations" in event.data) {
    const settings = event.data;
    algorithm = getAlgorithm(settings.maxIterations, settings.mandelbrotPower);
    palette = palettes[settings.paletteName];
  } else {
    const instruction = event.data;
    const scale = instruction.regionSize / instruction.imageSize;

    let index = 0;
    let currentImaginary = instruction.regionTopLeftImaginary;
    for (let y = 0; y < instruction.imageSize; y++) {
      let currentReal = instruction.regionTopLeftReal;
      for (let x = 0; x < instruction.imageSize; x++) {
        const fraction = algorithm(currentReal, currentImaginary);
        const rgb = palette(fraction);
        instruction.image.data[index++] = rgb[0];
        instruction.image.data[index++] = rgb[1];
        instruction.image.data[index++] = rgb[2];
        instruction.image.data[index++] = 255;
        currentReal += scale;
      }
      currentImaginary -= scale;
    }

    postMessage(instruction.image, [instruction.image.data.buffer]);
  }
};
