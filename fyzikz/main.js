import './style.css';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

let clock, scene, camera, renderer, stats;

let staticMeshGroup, dynamicMeshGroup;

init();

function init() {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);

    const container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(75, 75, 75);
    camera.lookAt(0, 0, 0);

    window.addEventListener( 'resize', onWindowResize );

    createStaticGeometry();

    createDynamicGeometry();

    createLighting();

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function createStaticGeometry() {
    staticMeshGroup = new THREE.Group();
    scene.add(staticMeshGroup);

    // Add a plane to represent the floor

    const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);

    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        side: THREE.FrontSide,
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

    planeMesh.rotation.x = -Math.PI / 2;

    staticMeshGroup.add(planeMesh);

    // Add a cube

    const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);

    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        side: THREE.FrontSide,
    });

    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

    cubeMesh.position.set(20, 5, -20);
    cubeMesh.rotation.set(0, 45, 0);

    staticMeshGroup.add(cubeMesh);

    // Add a pyramid

    const pyramidGeometry = new THREE.ConeGeometry(10, 10, 4, 1, false);

    const pyramidMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        side: THREE.FrontSide,
    });

    const pyramidMesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);

    pyramidMesh.position.set(-20, 5, 0);

    staticMeshGroup.add(pyramidMesh);

    // Add a cylinder
    
    const cylinderGeometry = new THREE.CylinderGeometry(10, 10, 10, 20);

    const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000ff,
        side: THREE.FrontSide,
    });

    const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    cylinderMesh.position.set(37, 5, 10);

    staticMeshGroup.add(cylinderMesh);

    // Add a torus

    const torusGeometry = new THREE.TorusGeometry(10, 3, 10, 20);

    const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        side: THREE.FrontSide,
    });

    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);

    torusMesh.position.set(10, 5, 35);
    torusMesh.rotation.set(30, 0, 0);

    staticMeshGroup.add(torusMesh);
}

function createDynamicGeometry() {
    dynamicMeshGroup = new THREE.Group();
    scene.add(dynamicMeshGroup);

    // Add a sphere

    const sphereGeometry = new THREE.SphereGeometry(2, 20, 20);

    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        side: THREE.FrontSide,
    });

    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphereMesh.position.set(0, 50, 0);

    dynamicMeshGroup.add(sphereMesh);
}


function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);
}

function animate() {
    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(animate);
}
