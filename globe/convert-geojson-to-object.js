import fs from 'fs'

const geojson = JSON.parse(fs.readFileSync('./ne_10m_populated_places_simple.json', 'utf8'))

const vertices = geojson.features.filter(
    // feature => feature.properties.featurecla === 'Admin-0 capital'
    // Features in the uk
    feature => true
).map(
    feature => feature.geometry.coordinates // [longitude, latitude]
).map(
    // Convert longitude and latitude to x, y, z coordinates
    ([longitude, latitude]) => {
        const phi = (90 - latitude) * Math.PI / 180
        const theta = (180 - longitude) * Math.PI / 180
        return [
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta)
        ]
    }
).flat(1)

const data = {
    "metadata":{
        "position":505,
        "type":"BufferGeometry",
        "generator":"io_three",
        "version":3
    },
    "data":{
        "attributes":{
            "position":{
                "itemSize":3,
                "type":"Float32Array",
                "array": vertices
            }
        }
    }
}

fs.writeFileSync('./points.json', JSON.stringify(data))
