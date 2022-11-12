import fs from 'fs'
import earcut from 'earcut'
import _ from 'lodash'

//
// Convert 'Populated Places' GeoJSON to a JavaScript object
//

let geojson = JSON.parse(fs.readFileSync('./ne_10m_populated_places_simple.json', 'utf8'))

let vertices = geojson.features.map(
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

let data = {
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


//
// Convert 'Countries' GeoJSON to a JavaScript object
//

geojson = JSON.parse(fs.readFileSync('./ne_10m_admin_0_countries.json', 'utf8'))

let feature = geojson.features.find(feature => feature.properties.NAME === 'Poland')

let geometry = earcut.flatten(feature.geometry.coordinates);

let indices = earcut(geometry.vertices, geometry.holes, geometry.dimensions);

vertices = _.chunk(geometry.vertices, 2).map(
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

data = {
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
        },
        "index":{
            "itemSize":1,
            "type":"Uint16Array",
            "array": indices
        }
    }
}

fs.writeFileSync('./countries.json', JSON.stringify(data))
