import './style.css';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';

let camera, scene, renderer, composer, mesh;

let mouseX = 0;
let mouseY = 0;

init();
animate();

function init() {
    const container = document.getElementById( 'container' );

    window.addEventListener( 'mousemove', onDocumentMouseMove );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

    camera.position.z = 2;

    scene = new THREE.Scene();

    const material = new THREE.MeshNormalMaterial({ wireframe: true });

    const geometry = new THREE.SphereGeometry( 1, 10, 10 );

    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );

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
}

function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - window.innerWidth / 2 );
    mouseY = ( event.clientY - window.innerHeight / 2 );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame(animate);

    if (mouseX > 300) {
        mesh.rotation.y += 0.01;
    } else if (mouseX < -300) {
        mesh.rotation.y -= 0.01;
    }

    if (mouseY > 300) {
        mesh.rotation.x += 0.01;
    } else if (mouseY < -300) {
        mesh.rotation.x -= 0.01;    
    }

    renderer.clear();
    composer.render( 0.01 );

    renderer.render( scene, camera );
}
