import 'leaflet/dist/leaflet.css'
import './styles.css'
import Threading from './threading.js'
import Leaflet from 'leaflet'

// Create a pool of workers to send instructions to
const pool = Threading(navigator.hardwareConcurrency)

// Main Leaflet map object
const leaflet = Leaflet.map('leaflet', {
  attributionControl: false,
  crs: Leaflet.CRS.Simple,
  minZoom: 1, // Prevent zooming out too much
  maxZoom: 45 // Prevent running out of precision
})

// Custom Leaflet layer for rendering a custom plane
const RenderLayer = Leaflet.GridLayer.extend({
  createTile: function (coordinates, callback) {
    const pixelSize = this.getTileSize().x
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = pixelSize
    const context = canvas.getContext('2d')
    const image = context.createImageData(pixelSize, pixelSize)
    const realSize = 1 / Math.pow(2, coordinates.z - 1)
    
    pool.addJob({
      image: image,
      x: coordinates.x * realSize,
      y: - coordinates.y * realSize,
      realSize: realSize,
      pixelSize: pixelSize,
      maxIterations: 255
    }, [image.data.buffer], (event) => {
      context.putImageData(event.data, 0, 0)
      callback(null, canvas)
    })

    return canvas
  }
})

// Set the view and add a fractal layer
leaflet.setView([0, 0], 1)
leaflet.addLayer(new RenderLayer())
