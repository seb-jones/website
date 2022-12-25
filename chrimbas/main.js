import './style.css';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Octree } from 'three/examples/jsm/math/Octree.js';

import { Capsule } from 'three/examples/jsm/math/Capsule.js';

let clock, scene, camera, renderer, stats;

let worldOctree, playerCollider, playerVelocity, playerDirection;

let keystates = {};

const STEPS_PER_FRAME = 5;

init();

function init() {

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x88ccee );
    scene.fog = new THREE.Fog( 0x88ccee, 0, 50 );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.rotation.order = 'YXZ';

    const fillLight1 = new THREE.HemisphereLight( 0x4488bb, 0x002244, 0.5 );
    fillLight1.position.set( 2, 1, 1 );
    scene.add( fillLight1 );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directionalLight.position.set( - 5, 25, - 1 );
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = - 30;
    directionalLight.shadow.camera.top	= 30;
    directionalLight.shadow.camera.bottom = - 30;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = - 0.00006;
    scene.add( directionalLight );

    const container = document.getElementById( 'container' );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    const loader = new GLTFLoader();

    loader.load( '/models/chrimbas.glb', ( gltf ) => {

        const model = gltf.scene;

        model.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

                child.material = new THREE.MeshToonMaterial( { color: 0xffffff } );

            }

        } );

        scene.add( model );

        worldOctree = new Octree();
        worldOctree.fromGraphNode( model );

        playerCollider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0, 1, 0 ), 0.35 );

        playerVelocity = new THREE.Vector3();

        playerDirection = new THREE.Vector3();

        window.addEventListener( 'resize', onWindowResize );
        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );
        document.addEventListener( 'mousedown', onMouseDown );
        document.body.addEventListener( 'mousemove', onMouseMove );

        animate();
    } );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onKeyDown(event) {

    keystates[event.code] = true;

}

function onKeyUp(event) {

    keystates[event.code] = false;

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

function animate() {

    const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    for ( let i = 0; i < STEPS_PER_FRAME; i ++ ) {

        controls( deltaTime );

        updatePlayer( deltaTime );

    }

    renderer.render( scene, camera );

    stats.update();

    requestAnimationFrame( animate );

}

function controls( deltaTime ) {

    const speedDelta = deltaTime * 25;

    if ( keystates[ 'KeyW' ] ) {

        playerVelocity.add( getForwardVector().multiplyScalar( speedDelta ) );

    }

    if ( keystates[ 'KeyS' ] ) {

        playerVelocity.add( getForwardVector().multiplyScalar( - speedDelta ) );

    }

    if ( keystates[ 'KeyA' ] ) {

        playerVelocity.add( getSideVector().multiplyScalar( - speedDelta ) );

    }

    if ( keystates[ 'KeyD' ] ) {

        playerVelocity.add( getSideVector().multiplyScalar( speedDelta ) );

    }

}

function getForwardVector() {

    camera.getWorldDirection( playerDirection );

    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;

}

function getSideVector() {

    camera.getWorldDirection( playerDirection );

    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross( camera.up );

    return playerDirection;

}

function updatePlayer( deltaTime ) {
    let damping = Math.exp( - 4 * deltaTime ) - 1;

    playerVelocity.addScaledVector( playerVelocity, damping );

    const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
    playerCollider.translate( deltaPosition );

    // playerCollisions();

    camera.position.copy( playerCollider.end );
}
