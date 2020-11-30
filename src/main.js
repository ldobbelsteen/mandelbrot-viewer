import 'leaflet/dist/leaflet.css'
import './styles.css'
import Pool from './pool.js'
import Leaflet from 'leaflet'

// Create a pool of workers to send instructions to
const pool = Pool(navigator.hardwareConcurrency)

// Main Leaflet map object
const leaflet = Leaflet.map('leaflet', {
  attributionControl: false,
  crs: Leaflet.CRS.Simple,
  minZoom: 1, // Prevent zooming out too much
  maxZoom: 45 // Prevent running out of precision
})

// Custom Leaflet layer for rendering a custom plane
const RenderLayer = Leaflet.GridLayer.extend({
  initialize: function () {
    this.on('tileunload', (event) => {
      event.tile.cancel()
    })
    pool.sendMessage({
      settings: true,
      maxIteration: 255,
      palette: 'Hue circle',
      power: 2
    })
  },
  createTile: function (coordinates, callback) {
    const pixelSize = this.getTileSize().x
    const tile = document.createElement('canvas')
    tile.width = tile.height = pixelSize
    const context = tile.getContext('2d')
    const image = context.createImageData(pixelSize, pixelSize)
    const realSize = 1 / Math.pow(2, coordinates.z - 1)

    tile.cancel = pool.addJob({
      image: image,
      real: coordinates.x * realSize,
      imaginary: - coordinates.y * realSize,
      size: realSize
    }, [image.data.buffer], (event) => {
      context.putImageData(event.data, 0, 0)
      callback(null, tile)
    })

    return tile
  }
})

// Add link to source code
const SourceText = Leaflet.Control.extend({
  options: {
    position: 'bottomright'
  },
  onAdd: function () {
    const box = Leaflet.DomUtil.create('div',
      'leaflet-control-layers leaflet-control-layers-expanded')
    const link = document.createElement('a')
    link.innerHTML = 'Source code'
    link.href = 'https://github.com/ldobbelsteen/mandelbrot-viewer'
    Leaflet.DomEvent.disableClickPropagation(box)
    box.appendChild(link)
    return box
  }
})

leaflet.setView([0, 0], 1)
leaflet.addControl(new SourceText())
leaflet.addLayer(new RenderLayer())
