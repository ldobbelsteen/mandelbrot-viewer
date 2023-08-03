export type Palette = (fraction: number) => [number, number, number];

/**
 * Set of available palettes for coloring the Mandelbrot set based on the
 * fractions return by escape time algorithms.
 */
export const palettes: Record<string, Palette> = {
  "Hue circle": (fraction: number) => {
    const section = fraction * 6;
    const intensity = 255 * (1 - Math.abs((section % 2) - 1));
    switch (Math.floor(section)) {
      case 0:
        return [255, intensity, 0];
      case 1:
        return [intensity, 255, 0];
      case 2:
        return [0, 255, intensity];
      case 3:
        return [0, intensity, 255];
      case 4:
        return [intensity, 0, 255];
      case 5:
        return [255, 0, intensity];
    }
    return [0, 0, 0];
  },
  "Hue circle (cyclic)": (fraction: number) => {
    const section = fraction * 6;
    const intensity = 255 * (1 - Math.abs((section % 2) - 1));
    switch (Math.floor(section)) {
      case 0:
        return [255, intensity, 0];
      case 1:
        return [intensity, 255, 0];
      case 2:
        return [0, 255, intensity];
      case 3:
        return [0, intensity, 255];
      case 4:
        return [intensity, 0, 255];
      case 5:
        return [255, 0, intensity];
    }
    return [255, intensity, 0];
  },
  "Gray scale": (fraction: number) => {
    const lightness = 255 * fraction;
    return [lightness, lightness, lightness];
  },
  "Gray scale (cyclic)": (fraction: number) => {
    const lightness = 255 * (1 - Math.abs(2 * fraction - 1));
    return [lightness, lightness, lightness];
  },
};
