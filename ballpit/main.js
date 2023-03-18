import './style.css';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let clock, scene, camera, renderer, stats;

init();

function init() {

    clock = new THREE.Clock();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.rotation.order = 'YXZ';
    camera.position.set( 0, 2, 5 );

    const ambientLight = new THREE.AmbientLight( 0x888888, 0.2 );
    scene.add( ambientLight );

    // const directionalLight = new THREE.DirectionalLight( 0x888888, 0.75 );
    // directionalLight.position.set( -7, 7, -7 );
    // directionalLight.castShadow = true;
    // scene.add( directionalLight );

    const pointLight = new THREE.PointLight( 0xffffff, 0.75 );
    pointLight.position.set( 0, 6, 0 );
    scene.add( pointLight );

    const container = document.getElementById( 'container' );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    const gltfLoader = new GLTFLoader();

    gltfLoader.load( '/models/ballpit.glb', ( gltf ) => {

        scene.add( gltf.scene );

        scene.traverse( ( object ) => {

            if ( object.isMesh ) {

                object.castShadow = true;
                object.receiveShadow = true;

                object.material = new THREE.MeshStandardMaterial( {
                    color: object.material.color,
                    side: THREE.FrontSide,
                    emissive: 0x222222,
                    emissiveIntensity: 0.5,
                } );
            }

        } );

        document.addEventListener( 'mousedown', onMouseDown );
        document.body.addEventListener( 'mousemove', onMouseMove );

        animate();

    } );
}

function onMouseDown() {

    document.body.requestPointerLock();

}

function onMouseMove() {

    if ( document.pointerLockElement === document.body ) {

        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    renderer.render( scene, camera );

    stats.update();

    requestAnimationFrame( animate );

}
