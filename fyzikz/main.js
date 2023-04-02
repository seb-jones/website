import './style.css';

import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let clock, scene, container, renderer, camera, stats;
let physicsWorld;
let terrainMesh;
const dynamicObjects = [];
let transformAux;

Ammo().then(function (AmmoLib) {
    Ammo = AmmoLib;

    (new GLTFLoader()).load('/models/fyzikz.glb', gltf => {
        terrainMesh = gltf.scene.children[0];

        initPhysics();
        initGraphics();
        animate();
    });
});

function initPhysics() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -6, 0));

    // create btBvhTriangleMeshShape from THREE.Mesh

    const geometry = terrainMesh.geometry;
    const vertices = geometry.attributes.position.array;
    const indices = geometry.index.array;

    const numVertices = vertices.length / 3;
    const numTriangles = indices.length / 3;

    const triangleMesh = new Ammo.btTriangleMesh(true, true);

    for (let i = 0; i < numTriangles; i++) {
        const i3 = i * 3;

        const index0 = indices[i3];
        const index1 = indices[i3 + 1];
        const index2 = indices[i3 + 2];

        const v0 = new Ammo.btVector3(vertices[index0 * 3], vertices[index0 * 3 + 1], vertices[index0 * 3 + 2]);
        const v1 = new Ammo.btVector3(vertices[index1 * 3], vertices[index1 * 3 + 1], vertices[index1 * 3 + 2]);
        const v2 = new Ammo.btVector3(vertices[index2 * 3], vertices[index2 * 3 + 1], vertices[index2 * 3 + 2]);

        triangleMesh.addTriangle(v0, v1, v2);
    }

    const triangleMeshShape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true, true);

    triangleMeshShape.setLocalScaling(new Ammo.btVector3(terrainMesh.scale.x, terrainMesh.scale.y, terrainMesh.scale.z));

    const localInertia = new Ammo.btVector3(0, 0, 0);

    const groundTransform = new Ammo.btTransform();

    groundTransform.setIdentity();

    const groundMass = 0;

    groundTransform.setOrigin(new Ammo.btVector3(0, 0, 0));

    const groundMotionState = new Ammo.btDefaultMotionState(groundTransform);

    const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, triangleMeshShape, localInertia));

    physicsWorld.addRigidBody(groundBody);

    transformAux = new Ammo.btTransform();
}

function initGraphics() {
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
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    scene.add(terrainMesh);

    createLighting();

    updateCameraAndRendererOnWindowResize();

    spawnDynamicSphereInRandomPositionOnInterval();
}

function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 100, 0);
    scene.add(pointLight);
}

function updateCameraAndRendererOnWindowResize() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    });
}

function spawnDynamicSphereInRandomPositionOnInterval() {
    setInterval(() => {
        // Create a ThreeJS mesh for the sphere

        const radius = 0.1;

        const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

        sphereMesh.position.x = Math.random() * 10 - 5;
        sphereMesh.position.y = 10;
        sphereMesh.position.z = Math.random() * 10 - 5;

        scene.add(sphereMesh);

        // Create an AmmoJS rigid body for the sphere and add it to the physics world

        const sphereShape = new Ammo.btSphereShape(radius);

        const localInertia = new Ammo.btVector3(0, 0, 0);

        sphereShape.calculateLocalInertia(1, localInertia);

        const sphereTransform = new Ammo.btTransform();

        sphereTransform.setIdentity();

        const sphereMass = 1;

        sphereTransform.setOrigin(new Ammo.btVector3(sphereMesh.position.x, sphereMesh.position.y, sphereMesh.position.z));

        const sphereMotionState = new Ammo.btDefaultMotionState(sphereTransform);

        const sphereBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(sphereMass, sphereMotionState, sphereShape, localInertia));

        physicsWorld.addRigidBody(sphereBody);

        sphereMesh.userData.physicsBody = sphereBody;

        // Add the sphere to the list of objects to be updated

        dynamicObjects.push(sphereMesh);
    }, 60);
}

function animate() {
    const deltaTime = clock.getDelta();

    updatePhysics(deltaTime);

    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(animate);
}

function updatePhysics(deltaTime) {
    physicsWorld.stepSimulation(deltaTime, 10);
        
    // Update the ThreeJS meshes with the positions of the AmmoJS rigid bodies

    for (let i = 0; i < dynamicObjects.length; i++) {
        const objThree = dynamicObjects[i];
        const objAmmo = objThree.userData.physicsBody;

        const ms = objAmmo.getMotionState();

        if (ms) {
            ms.getWorldTransform(transformAux);

            const p = transformAux.getOrigin();
            const q = transformAux.getRotation();

            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
}
