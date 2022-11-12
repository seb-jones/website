import './style.css';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';

let camera, scene, renderer, composer;

let point;

init();
animate();

function init() {
    const container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.z = 3;

    scene = new THREE.Scene();

    const loader = new THREE.BufferGeometryLoader();

    loader.load('/globe/points.json', function ( geometry ) {
        point = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x00ffff, size: .05 } ) );
        scene.add( point );
    });

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );
    renderer.autoClear = false;

    const renderModel = new RenderPass( scene, camera );
    const effectBloom = new BloomPass( 1.25 );
    const effectFilm = new FilmPass( 0.35, 0.95, 2048, false );

    composer = new EffectComposer( renderer );

    composer.addPass( renderModel );
    composer.addPass( effectBloom );
    composer.addPass( effectFilm );

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
        case 38: /*up*/
        case 87: /*W*/ point.rotation.x -= 0.1; break;
        case 37: /*left*/
        case 65: /*A*/ point.rotation.y -= 0.1; break;
        case 40: /*down*/
        case 83: /*S*/ point.rotation.x += 0.1; break;
        case 39: /*right*/
        case 68: /*D*/ point.rotation.y += 0.1; break;
        case 82: /*R*/ point.rotation.z += 0.1; break;
        case 70: /*F*/ point.rotation.z -= 0.1; break;
    }
}

function animate() {
    requestAnimationFrame(animate);

    renderer.clear();
    composer.render( 0.01 );

    renderer.render( scene, camera );
}
