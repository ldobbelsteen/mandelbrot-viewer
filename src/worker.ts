const worker: Worker = self as any

this.onmessage = ({ data }) => {
  const slab: Slab = data.slab
  const coordinates: Coords = data.coordinates
  const pixels = new Uint8ClampedArray(slab.width * slab.height * 4)
  let index = 0
  let realY = slab.top * coordinates.scaleY - coordinates.y
  for (let y = 0; y < slab.height; y++) {
    let realX = coordinates.x
    for (let x = 0; x < slab.width; x++) {
      realX += coordinates.scaleX
      const fraction = mandelbrot(realX, realY, 255)
      const colors = hueToRgb(fraction)
      pixels[index++] = colors[0]
      pixels[index++] = colors[1]
      pixels[index++] = colors[2]
      pixels[index++] = 255
    }
    realY += coordinates.scaleY
  }
  worker.postMessage({ pixels: pixels, index: slab.index }, [pixels.buffer])
}

function mandelbrot(x0: number, y0: number, maxIterations: number) {
  const inCardiod = 8 * x0**4 + x0**2 * (16 * y0**2 - 3) + x0 + 8 * y0**4 - 3 * y0**2 <= 0.09375
  const inBulb = x0**2 + 2 * x0 + y0**2 <= -0.9375
  if (inCardiod || inBulb) return 1
  let x = 0
  let y = 0
  let xSquared = 0
  let ySquared = 0
  let iterations = 0
  while (xSquared + ySquared <= 4 && iterations < maxIterations) {
    y = 2 * x * y + y0
    x = xSquared - ySquared + x0
    xSquared = x * x
    ySquared = y * y
    iterations++
  }
  if (iterations < maxIterations) {
    const smoothFactor = Math.log(Math.log(xSquared + ySquared) / (2 * Math.log(2))) / Math.log(2)
    iterations += 1 - smoothFactor
  }
  return iterations / maxIterations
}

function hueToRgb(fraction: number) {
  const hue = fraction * 6
  const intensity = 255 * (1 - Math.abs((hue % 2) - 1))
  switch(Math.floor(hue)) {
    case 0:
      return [255, intensity, 0]
    case 1:
      return [intensity, 255, 0]
    case 2:
      return [0, 255, intensity]
    case 3:
      return [0, intensity, 255]
    case 4:
      return [intensity, 0, 255]
    case 5:
      return [255, 0, intensity]
    case 6:
      return [0, 0, 0]
  }
}
