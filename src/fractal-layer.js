import ThreadPool from './thread-pool.js'
import Leaflet from 'leaflet'

const pool = ThreadPool(navigator.hardwareConcurrency)

export default Leaflet.GridLayer.extend({
  createTile: function (coordinates) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const size = this.getTileSize().x
    canvas.width = canvas.height = size
    const image = context.createImageData(size, size)
    const zoom = 1 / Math.pow(2, coordinates.z - 1)

    const message = {
      image: image,
      x: coordinates.x * zoom,
      y: - coordinates.y * zoom,
      realSize: zoom,
      pixelSize: size
    }

    const transfer = [image.data.buffer]

    const callback = (event) => {
      context.putImageData(event.data, 0, 0)
    }

    pool.addJob(message, transfer, callback)

    return canvas
  }
})