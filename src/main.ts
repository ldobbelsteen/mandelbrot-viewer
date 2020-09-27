interface View {
  name: string
  left: number
  right: number
  bottom: number
  top: number
}

interface Slab {
  top: number
  height: number
  width: number
  index: number
}

interface Coords {
  x: number
  y: number
  scaleX: number
  scaleY: number
}

const concurrency = window.navigator.hardwareConcurrency
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const workers: Worker[] = new Array(concurrency)
const slabs: Slab[] = new Array(concurrency * 4)

let image: ImageData
let coordinates: Coords
let workersBusy: boolean
let workersBehind: boolean
let workersDone: number
let currentSlab: number

function init() {
  for (let i = 0; i < workers.length; i++) {
    const worker = new Worker('worker.js')
    worker.onmessage = ({ data }) => {
      try {
        image.data.set(data.pixels, data.index)
      } catch {
        render()
      }
      if (currentSlab < slabs.length) {
        instruct(worker)
      } else {
        workersDone++
        if (workersDone === workers.length) {
          workersBusy = false
          context.putImageData(image, 0, 0)
          if (workersBehind) {
            render()
          }
        }
      }
    }
    workers[i] = worker
  }
}

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  image = context.createImageData(canvas.width, canvas.height)
  const slabHeight = Math.ceil(canvas.height / slabs.length)
  let currentTop = 0
  for (let i = 0; i < slabs.length; i++) {
    const slab = {
      top: currentTop,
      height: currentTop + slabHeight < canvas.height ? slabHeight : canvas.height - currentTop,
      width: canvas.width,
      index: currentTop * canvas.width * 4
    }
    currentTop += slab.height
    slabs[i] = slab
  }
}

function reset() {
  const set: View = {
    name: 'mandelbrot',
    left: -2.05,
    right: 0.6,
    bottom: -1.2,
    top: 1.2
  }
  const setWidth = Math.abs(set.left - set.right)
  const setHeight = Math.abs(set.top - set.bottom)
  const setRatio = setWidth / setHeight
  const canvasRatio = canvas.width / canvas.height
  coordinates = {
    x: set.left,
    y: set.top,
    scaleX: setWidth / canvas.width,
    scaleY: setHeight / canvas.height,
  }
  if (canvasRatio > setRatio) {
    coordinates.scaleX *= canvasRatio / setRatio
    coordinates.x -= (canvas.width * coordinates.scaleX - setWidth) / 2
  } else {
    coordinates.scaleY *= setRatio / canvasRatio
    coordinates.y += (canvas.height * coordinates.scaleY - setHeight) / 2
  }
}

function instruct(worker) {
  const slab = slabs[currentSlab++]
  worker.postMessage({ slab, coordinates })
}

function render() {
  if (workersBusy) {
    workersBehind = true
    return
  } else {
    workersBehind = false
    workersBusy = true
    workersDone = 0
    currentSlab = 0
    workers.forEach((worker) => {
      instruct(worker)
    })
  }
}

function pixelToReal(pX, pY) {
  const rX = pX * coordinates.scaleX + coordinates.x
  const rY = pY * coordinates.scaleY - coordinates.y
  return [rX, rY]
}

window.addEventListener('load', () => {
  init()
  resize()
  reset()
  render()
})

window.addEventListener('resize', () => {
  resize()
  reset()
  render()
})

window.addEventListener('wheel', (event) => {
  const zoomFactor = 0.16
  const [mouseX, mouseY] = pixelToReal(event.pageX, event.pageY)
  const zoom = event.deltaY < 0 ? 1 - zoomFactor : 1 + zoomFactor
  coordinates.scaleX *= zoom
  coordinates.scaleY *= zoom
  coordinates.x = (coordinates.x - mouseX) * zoom + mouseX
  coordinates.y = (coordinates.y + mouseY) * zoom - mouseY
  render()
})
