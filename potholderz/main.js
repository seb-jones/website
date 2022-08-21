import './style.css';

import * as THREE from 'three';

import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';

let camera, scene, renderer;

let uniforms;

init();

function init() {

    const container = document.getElementById( 'animated-background-container' );

    camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

    scene = new THREE.Scene();

    const geometry = new THREE.PlaneGeometry( 2, 2 );

    uniforms = {
        time: { value: 1.0 },
        mouse: { value: new THREE.Vector2(0.0, 0.0) },
    };

    const material = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader,
        fragmentShader,

    } );

    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false });
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

    onWindowResize();

    window.addEventListener( 'resize', onWindowResize );

    // on mouse move
    document.addEventListener('mousemove', function(event) {
        // normalize mouse x and y to 0 to 1
        uniforms.mouse.value = new THREE.Vector2(
            event.clientX / window.innerWidth,
            1 - (event.clientY / window.innerHeight),
        );
    });

    animate();

    document.body.style.animation = 'fadeIn 0.75s ease-in-out';
    document.body.style.opacity = '1.0';
}

function onWindowResize() {
    const width = 128;

    // calculate height relative to width 
    const height = width / (document.documentElement.scrollWidth / document.documentElement.scrollHeight);

    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);

    uniforms[ 'time' ].value = performance.now() * 0.001;

    renderer.render( scene, camera );
}
