import './style.css';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let clock, scene, container, renderer, camera, stats;
let raycaster, pointer, highlightColumnMesh;
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
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);

    (new GLTFLoader()).load('/models/fyzikz.glb', gltf => {
        createStaticMeshes(gltf);

        createLighting();

        createRaycaster();

        updateCameraAndRendererOnWindowResize();

        animate();
    });
}

function updateCameraAndRendererOnWindowResize() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    });
}

function createStaticMeshes(gltf) {
    staticMeshGroup = new THREE.Group();

    staticMeshGroup.add(gltf.scene);

    scene.add(staticMeshGroup);
}


function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);
}

function createRaycaster() {
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    highlightColumnMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10),
        new THREE.MeshBasicMaterial({ color: 0xffd700, opacity: 0.5, transparent: true }),
    );

    highlightColumnMesh.visible = false;

    scene.add(highlightColumnMesh);

    container.addEventListener('pointermove', event => {
        pointer.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        pointer.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(staticMeshGroup.children);

        if (intersects.length > 0) {
            highlightColumnMesh.visible = true;
            highlightColumnMesh.position.copy(intersects[0].point);
            highlightColumnMesh.position.y += 0.5;

            document.body.style.cursor = 'none';
        } else {
            highlightColumnMesh.visible = false;

            document.body.style.cursor = 'auto';
        }
    });
}

function animate() {
    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(animate);
}
