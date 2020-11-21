export default (fraction) => {
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
