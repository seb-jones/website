import './style.css';

import * as THREE from 'three';

import { AmmoPhysics } from 'three/examples/jsm/physics/AmmoPhysics.js';

import Stats from 'three/examples/jsm/libs/stats.module.js';

let clock, scene, container, renderer, camera, stats;
let raycaster, pointer, highlightColumnMesh, highlightCircleMesh;
let physics;
let staticMeshGroup, dynamicMeshGroup;

init();

function init() {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);

    container = document.getElementById('container');

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

    createPhysics();

    createRaycaster();

    spawnDynamicSphereOnMouseClick();

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

    // Add a box to represent the floor

    const floorGeometry = new THREE.BoxGeometry(100, 100, 1, 1);

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        side: THREE.FrontSide,
    });

    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

    floorMesh.rotation.x = -Math.PI / 2;

    staticMeshGroup.add(floorMesh);

    // Add 10 boxes of random size, position and rotation

    for (let i = 0; i < 100; i++) {
        const boxGeometry = new THREE.BoxGeometry(
            Math.random() * 10 + 5,
            Math.random() * 10 + 5,
            Math.random() * 10 + 5,
            1,
            1,
            1,
        );

        const boxMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            side: THREE.FrontSide,
        });

        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

        boxMesh.position.set(
            Math.random() * 100 - 50,
            10,
            Math.random() * 100 - 50,
        );

        boxMesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
        );

        staticMeshGroup.add(boxMesh);
    }
}

function createDynamicGeometry() {
    dynamicMeshGroup = new THREE.Group();

    scene.add(dynamicMeshGroup);

    const sphereMesh = createDynamicSphere();

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

async function createPhysics() {
    physics = await AmmoPhysics();

    // Add all static meshes to the physics world with a mass of 0
    staticMeshGroup.children.forEach(mesh => physics.addMesh(mesh, 0));

    // Add all dynamic meshes to the physics world with a mass of 1
    dynamicMeshGroup.children.forEach(mesh => physics.addMesh(mesh, 1));
}

function createRaycaster() {
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    
    highlightColumnMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 200, 10),
        new THREE.MeshBasicMaterial({ color: 0xffd700, opacity: 0.5, transparent: true }),
    );

    highlightColumnMesh.visible = false;

    scene.add(highlightColumnMesh);

    highlightCircleMesh = new THREE.Mesh(
        new THREE.CircleGeometry(2, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );

    highlightCircleMesh.position.y = 2;
    highlightCircleMesh.rotation.x = -Math.PI / 2;
    highlightCircleMesh.visible = false;

    scene.add(highlightCircleMesh);

    container.addEventListener('pointermove', event => {
        pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        pointer.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(staticMeshGroup.children);

        if (intersects.length > 0) {
            highlightColumnMesh.visible = true;
            highlightColumnMesh.position.copy(intersects[0].point);
            highlightColumnMesh.position.y += 100.5;

            highlightCircleMesh.visible = true;
            highlightCircleMesh.position.copy(intersects[0].point);
            highlightCircleMesh.position.y += 0.5;

            document.body.style.cursor = 'none';
        } else {
            highlightColumnMesh.visible = false;
            highlightCircleMesh.visible = false;

            document.body.style.cursor = 'auto';
        }
    });
}

function spawnDynamicSphereOnMouseClick() {
    container.addEventListener('click', event => {
        if (!highlightColumnMesh.visible) {
            return;
        }

        const sphereMesh = createDynamicSphere();

        sphereMesh.position.copy(highlightColumnMesh.position);

        sphereMesh.position.y = 50;

        physics.addMesh(sphereMesh, 1);

        dynamicMeshGroup.add(sphereMesh);
    });
}

function createDynamicSphere() {
    const sphereGeometry = new THREE.SphereGeometry(2, 20, 20);

    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        side: THREE.FrontSide,
    });

    return new THREE.Mesh(sphereGeometry, sphereMaterial);
}


function animate() {
    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(animate);
}
