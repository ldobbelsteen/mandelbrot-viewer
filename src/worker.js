import Mandelbrot from './mandelbrot.js'

onmessage = (event) => {
  const {image, pixelSize, x, y, realSize, maxIterations} = event.data
  let index = 0
  const scale = realSize / pixelSize
  for (let pY = 0, rY = y; pY < pixelSize; pY++, rY -= scale) {
    for (let pX = 0, rX = x; pX < pixelSize; pX++, rX += scale) {
      const fraction = Mandelbrot(rX, rY, maxIterations)
      const colors = hueToRgb(fraction)
      image.data[index++] = colors[0]
      image.data[index++] = colors[1]
      image.data[index++] = colors[2]
      image.data[index++] = 255
    }
  }
  postMessage(image, [image.data.buffer])
}

// Convert a fraction with 0 <= fraction <= 1 to an RGB color
function hueToRgb (fraction) {
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
