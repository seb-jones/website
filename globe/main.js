import './style.css';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';

let camera, scene, renderer, composer;

let points = null;
let lines = [];
let meshes = [];

init();
animate();

function init() {
    const container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.z = 2.5;

    scene = new THREE.Scene();

    // Load 'populated places' points
    const bufferGeometryLoader = new THREE.BufferGeometryLoader();
    bufferGeometryLoader.load('/globe/points.json', function ( geometry ) {
        points = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x00ff00, size: .025 } ) );
        // scene.add( points );
    });

    const fileLoader = new THREE.FileLoader();

    // Load countries polygons
    fileLoader.load('/globe/countries.json', function ( data ) {
        const countries = JSON.parse(data);

        for (let country of countries) {
            const geometry = new THREE.BufferGeometry();
            geometry.setIndex(new THREE.Uint16BufferAttribute(country.indices, 1));
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(country.vertices, 3));
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const mesh = new THREE.Mesh(geometry, material);
            meshes.push(mesh);

            scene.add(mesh);
        }
    });


    // Load country lines
    fileLoader.load('/globe/country-lines.json', function ( data ) {
        const countries = JSON.parse(data);

        for (let country of countries) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(country.vertices, 3));
            const material = new THREE.LineBasicMaterial({ color: 0x000000 });
            const line = new THREE.LineLoop(geometry, material);

            // scene.add(line);

            lines.push(line);
        }
    });

    // Sphere representing the Earth
    const geometry = new THREE.SphereGeometry( 0.9, 100, 100 );
    const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    const sphere = new THREE.Mesh( geometry, material );
    // scene.add( sphere );

    scene.rotation.y = 0.75;
    scene.rotation.x = 0.75;

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );
    renderer.autoClear = false;


    composer = new EffectComposer( renderer );

    const renderModel = new RenderPass( scene, camera );
    composer.addPass( renderModel );

    // const effectBloom = new BloomPass( 1.25 );
    // composer.addPass( effectBloom );

    // const effectFilm = new FilmPass( 0.35, 0.95, 2048, false );
    // composer.addPass( effectFilm );
    
    onWindowResize();

    window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame(animate);

    scene.rotation.y += 0.005;

    renderer.clear();
    composer.render( 0.01 );

    renderer.render( scene, camera );
}
