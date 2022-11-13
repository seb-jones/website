import './style.css';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';

let camera, scene, renderer, composer;

let points = null;
let meshes = [];

init();
animate();

function init() {
    const container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.z = 2.0;

    scene = new THREE.Scene();

    // Load 'populated places' points
    const bufferGeometryLoader = new THREE.BufferGeometryLoader();
    bufferGeometryLoader.load('/globe/points.json', function ( geometry ) {
        points = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x00ff00, size: .025 } ) );
        // scene.add( points );
    });

    // Load countries geometry
    const fileLoader = new THREE.FileLoader();
    fileLoader.load('/globe/countries.json', function ( data ) {
        const countries = JSON.parse(data);

        for (let country of countries) {
            const geometry = new THREE.BufferGeometry();
            geometry.setIndex(new THREE.Uint16BufferAttribute(country.indices, 1));
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(country.vertices, 3));
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);

            scene.add(mesh);

            meshes.push(mesh);
        }
    });

    // Sphere representing the Earth
    const geometry = new THREE.SphereGeometry( 0.99, 32, 32 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    const sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    scene.rotation.y = 0;
    scene.rotation.x = 0;

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

    window.addEventListener( 'keydown', onKeyDown );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}

function onKeyDown( event ) {
    switch ( event.keyCode ) {
        case 38: /*up*/ scene.rotation.x -= 0.1; break;
        case 40: /*down*/ scene.rotation.x += 0.1; break;
    }
}

function animate() {
    requestAnimationFrame(animate);

    scene.rotation.y += 0.01;

    renderer.clear();
    composer.render( 0.01 );

    renderer.render( scene, camera );
}
