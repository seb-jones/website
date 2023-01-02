import './style.css';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { Octree } from 'three/examples/jsm/math/Octree.js';

import { Capsule } from 'three/examples/jsm/math/Capsule.js';

let clock, scene, camera, renderer, stats;

let worldOctree, playerCollider, playerVelocity, playerDirection;

let keystates = {};

let snow;

let balls = [];
let ballIndex = 0;

const STEPS_PER_FRAME = 5;
const NUMBER_OF_BALLS = 20;
const PARTICLES_PER_BALL = 20
const NUMBER_OF_BALL_PARTICLES = NUMBER_OF_BALLS * PARTICLES_PER_BALL;
const GRAVITY = 15;

init();

function init() {

    clock = new THREE.Clock();

    const textureCube = new THREE.CubeTextureLoader().load( [
        '/textures/skybox/clouds1_east_g.png',
        '/textures/skybox/clouds1_west_g.png',
        '/textures/skybox/clouds1_up_g.png',
        '/textures/skybox/clouds1_down_g.png',
        '/textures/skybox/clouds1_north_g.png',
        '/textures/skybox/clouds1_south_g.png',
    ] );

    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 0x88aacc );
    scene.background = textureCube;
    // scene.fog = new THREE.Fog( 0x88aacc, 0, 22 );

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.rotation.order = 'YXZ';
    camera.rotation.y = -90;

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

    const gltfLoader = new GLTFLoader();

    gltfLoader.load( '/models/chrimbas.glb', ( gltf ) => {

        // Set up snow effect
        {
            const geometry = new THREE.BufferGeometry();

            const positions = [];

            for ( let i = 0; i < 10000; i ++ ) {

                const x = (Math.random() * 50) - 25;
                const y = (Math.random() * 25);
                const z = (Math.random() * 50) - 25;

                positions.push( x, y, z );

            }

            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

            const textureLoader = new THREE.TextureLoader();

            const map = textureLoader.load( '/sprites/snowflake.png' );

            const material = new THREE.PointsMaterial( {
                size: .11,
                map,
                blending: THREE.AdditiveBlending,
                depthTest: true,
                transparent: true,
                fog: false,
            });

            snow = new THREE.Points( geometry, material );

            scene.add( snow );
        }

        // Set up world

        const model = gltf.scene;

        model.traverse( function ( child ) {

            if ( child.isMesh ) {

                if (child.name !== 'Fences') {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

                const color = child.material.color;

                if (child.name === 'Eyes') {
                    child.material = new THREE.MeshPhongMaterial( { color, specular: 0xffffff, shininess: 100 } );
                } else {
                    child.material = new THREE.MeshToonMaterial( { color, side: THREE.DoubleSide } );
                }
            }

        } );

        scene.add( model );

        // Set up snowballs

        {
            const radius = 0.1;

            const geometry = new THREE.IcosahedronGeometry( radius, 3 );

            const material = new THREE.MeshToonMaterial( { color: 0xffffff, side: THREE.DoubleSide } );

            for ( let i = 0; i < NUMBER_OF_BALLS; i ++ ) {

                const mesh = new THREE.Mesh( geometry, material );
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                scene.add( mesh );

                let particles = [];

                for (let j = 0; j < PARTICLES_PER_BALL; j++) {
                    const particle = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.04, 0 ), material );
                    particle.userData.velocity = new THREE.Vector3();
                    scene.add(particle);
                    particles.push(particle);
                }

                balls.push( {
                    mesh,
                    particles,
                    collider: new THREE.Sphere( new THREE.Vector3(-100, -100, -100), radius ),
                    velocity: new THREE.Vector3(),
                } );
            }
        }

        // Physics

        worldOctree = new Octree();
        worldOctree.fromGraphNode( model );

        const x = 10;
        const z = -5;

        playerCollider = new Capsule( new THREE.Vector3( x, 0.35, z ), new THREE.Vector3( x, 1, z ), 0.35 );

        playerVelocity = new THREE.Vector3();

        playerDirection = new THREE.Vector3();

        // Event Listeners

        window.addEventListener( 'resize', onWindowResize );
        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );
        document.addEventListener( 'mousedown', onMouseDown );
        document.addEventListener( 'mouseup', onMouseUp );
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

function onMouseUp() {

    if (document.pointerLockElement === document.body) {
        throwBall();
    }

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

        updateBalls( deltaTime );

        updateSnowfall( deltaTime);

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

    const collision = worldOctree.capsuleIntersect( playerCollider );

    if ( collision ) {

        playerCollider.translate( collision.normal.clone().multiplyScalar( collision.depth ) );

    }

    camera.position.copy( playerCollider.end );
}

function throwBall() {

    const ball = balls[ ballIndex ];

    camera.getWorldDirection( playerDirection );

    ball.collider.center.copy( playerCollider.end ).addScaledVector( playerDirection, playerCollider.radius * 1.5 );

    // This defines how hard the ball is thrown
    const impulse = 25;

    ball.velocity.copy( playerDirection ).multiplyScalar( impulse );
    ball.velocity.addScaledVector( playerVelocity, 2 );

    ballIndex = ( ballIndex + 1 ) % balls.length;

}

function updateBalls( deltaTime ) {

    balls.forEach( ball => {

        ball.collider.center.addScaledVector( ball.velocity, deltaTime );

        const collision = worldOctree.sphereIntersect( ball.collider );

        if (collision) {

            // Move ball particles to the collision point

            ball.particles.forEach( particle => {
                particle.position.copy(ball.collider.center); 

                particle.userData.velocity = new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize().multiplyScalar(2);
            } );

            // Move the ball outside the bounding box

            ball.collider.center.set(-100, -100, -100);

            ball.velocity.setScalar( 0 );

        }

        ball.velocity.y -= GRAVITY * deltaTime;

        const damping = Math.exp( - 1.5 * deltaTime ) - 1;

        ball.velocity.addScaledVector( ball.velocity, damping );

        ball.mesh.position.copy( ball.collider.center );

        ball.particles.forEach( particle => {

            particle.position.addScaledVector( particle.userData.velocity, deltaTime );

            particle.userData.velocity.y -= GRAVITY * deltaTime;

            particle.userData.velocity.addScaledVector( particle.userData.velocity, damping );

        } );
    } );

}

function updateSnowfall( deltaTime ) {

    const snowPositions = snow.geometry.attributes.position.array;

    for ( let i = 0; i < snowPositions.length; i += 3 ) {

        snowPositions[ i + 1 ] -= deltaTime * 0.5;

        if ( snowPositions[ i + 1 ] < 0 ) {

            snowPositions[ i + 1 ] = 25;

        }

    }

    snow.geometry.attributes.position.needsUpdate = true;
}
