import 'leaflet/dist/leaflet.css'
import './styles.css'

import FractalLayer from './fractal-layer.js'
import Leaflet from 'leaflet'

const leaflet = Leaflet.map('leaflet', { crs: Leaflet.CRS.Simple })
leaflet.setView([0, 0], 1)
leaflet.addLayer(new FractalLayer())
