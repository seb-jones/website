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

data = geojson
    .features
    .filter(feature => ['Polygon', 'MultiPolygon'].includes(feature.geometry.type))
    .map(feature => ({
        name: feature.properties.NAME,
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates
    }))
    .reduce((acc, feature) => {
        if (feature.type === 'Polygon') {
            acc.push({
                name: feature.name,
                coordinates: feature.coordinates
            })
        } else {
            feature.coordinates.forEach(coordinates => {
                acc.push({
                    name: feature.name,
                    coordinates
                })
            })
        }
        return acc
    }, [])
    .map(feature => {
        const geometry = earcut.flatten(feature.coordinates);

        const indices = earcut(geometry.vertices, geometry.holes, geometry.dimensions);

        const vertices = _.chunk(geometry.vertices, 2).map(
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

        return {
            name: feature.name,
            vertices,
            indices
        }
    })

fs.writeFileSync('./countries.json', JSON.stringify(data))
