/**
 * Takes a point on the complex plane (with a real and an imaginary part) and
 * determines whether it is a part of the Mandelbrot set. The output is the
 * ratio of the iterations of the Mandelbrot function it took to reach a
 * modulus of 2 and the maximum iterations. The output is 1 if the point
 * doesn't escape before maxIterations number of iterations.
 */
export default (real, imaginary, maxIterations) => {
  if (inCardioid(real, imaginary)) return 1
  if (inBulb(real, imaginary)) return 1
  let x = 0
  let y = 0
  let xSquared = 0
  let ySquared = 0
  let iterations = 0
  while (xSquared + ySquared <= 4) {
    y = 2 * x * y + imaginary
    x = xSquared - ySquared + real
    xSquared = x * x
    ySquared = y * y
    if (++iterations === maxIterations) return 1
  }
  iterations += 1 - Math.log2(Math.log2(xSquared + ySquared))
  if (iterations < 0) return 0
  return iterations / maxIterations
}

// Check whether a point on the complex plane is in the main cardioid
function inCardioid (real, imaginary) {
  const realCenter = real - 0.25
  const imaginarySquared = Math.pow(imaginary, 2)
  const circle = Math.pow(realCenter, 2) + imaginarySquared
  const cardioid = circle * (circle + realCenter)
  const inCardioid = cardioid <= 0.25 * imaginarySquared
  return inCardioid
}

// Check whether a point on the complex plane is in the second bulb
function inBulb (real, imaginary) {
  const bulb = Math.pow(real + 1, 2) + Math.pow(imaginary, 2)
  const inBulb = bulb <= 0.0625
  return inBulb
}
