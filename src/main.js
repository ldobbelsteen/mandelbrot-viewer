import 'leaflet/dist/leaflet.css'
import './styles.css'

import FractalLayer from './fractal-layer.js'
import Leaflet from 'leaflet'

const options = {
  attributionControl: false,
  crs: Leaflet.CRS.Simple,
  minZoom: 1,
  maxZoom: 45
}

const leaflet = Leaflet.map('leaflet', options)
leaflet.setView([0, 0], 1)
leaflet.addLayer(new FractalLayer())
