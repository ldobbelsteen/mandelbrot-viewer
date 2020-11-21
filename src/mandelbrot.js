export default (x0, y0, maxIterations) => {
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
