onmessage = (event) => {
  const {
    image,
    maxIterations,
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
      const fraction = mandelbrot(rX, rY, maxIterations)
      const colors = hueToRgb(fraction)
      pixels[index++] = colors[0]
      pixels[index++] = colors[1]
      pixels[index++] = colors[2]
      pixels[index++] = 255
    }
  }

  postMessage(image, [image.data.buffer])
}

function mandelbrot (x0, y0, maxIterations)  {
  const inCardiod = 8 * Math.pow(x0, 4) + Math.pow(x0, 2) * (16 * Math.pow(y0, 2) - 3) + x0 + 8 * Math.pow(y0, 4) - 3 * Math.pow(y0, 2) <= 0.09375
  const inBulb = Math.pow(x0, 2) + 2 * x0 + Math.pow(y0, 2) <= -0.9375
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