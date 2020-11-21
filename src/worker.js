import Mandelbrot from './mandelbrot.js'
import HueToRGB from './hue-to-rgb.js'

onmessage = (event) => {
  const {
    image,
    pixelSize,
    realSize,
    x,
    y
  } = event.data

  let index = 0
  const pixels = image.data
  const scale = realSize / pixelSize
  
  for (let pY = 0, rY = y; pY < pixelSize; pY++, rY -= scale) {
    for (let pX = 0, rX = x; pX < pixelSize; pX++, rX += scale) {
      const fraction = Mandelbrot(rX, rY, 255)
      const colors = HueToRGB(fraction)
      pixels[index++] = colors[0]
      pixels[index++] = colors[1]
      pixels[index++] = colors[2]
      pixels[index++] = 255
    }
  }

  postMessage(image, [image.data.buffer])
}