import Mandelbrot from './mandelbrot.js'
import { hue } from './color.js'

onmessage = (event) => {
  const {image, pixelSize, x, y, realSize, maxIterations} = event.data
  let index = 0
  const scale = realSize / pixelSize
  for (let pY = 0, rY = y; pY < pixelSize; pY++, rY -= scale) {
    for (let pX = 0, rX = x; pX < pixelSize; pX++, rX += scale) {
      const fraction = Mandelbrot(rX, rY, maxIterations)
      const colors = hue(fraction)
      image.data[index++] = colors[0]
      image.data[index++] = colors[1]
      image.data[index++] = colors[2]
      image.data[index++] = 255
    }
  }
  postMessage(image, [image.data.buffer])
}
