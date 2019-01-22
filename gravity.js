const canvas = document.getElementsByTagName('canvas')[0];
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
scene.enablePhysics(BABYLON.Vector3.Zero(), new BABYLON.AmmoJSPlugin());
scene.clearColor = new BABYLON.Color3(0, 0, 0);
const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 0, -300), scene);
camera.speed = 15;
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

let spheres = [];

for (let i = 0; i < 100; i++) {
    let diameter = Math.random() + 1;
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere' + 1, {diameter}, scene);

    let theta = Math.random() * Math.PI;
    let phi = Math.random() * 2 * Math.PI;
    let r = 100;
    //sphere.position = new BABYLON.Vector3(Math.random() * 70 - 35, Math.random() * 70 - 35, Math.random() * 70 - 35);
    sphere.position = new BABYLON.Vector3(r * Math.sin(theta) * Math.cos(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(theta));

    const sphereMaterial = new BABYLON.StandardMaterial('sphereMaterial', scene);
    sphereMaterial.emissiveColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    sphere.material = sphereMaterial;

    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
        mass: 1000 * diameter,
        restitution: 0
    });

    spheres.push(sphere);
}

scene.onBeforePhysicsObservable.add(function processPhysics() {
    for (let a = 0; a < spheres.length - 1; a++) {
        for (let b = a + 1; b < spheres.length; b++) {
            let sphereA = spheres[a];
            let sphereB = spheres[b];

            //vec is posB - posA
            let vec = sphereB.position.subtract(sphereA.position);
            let distanceSquaredVec = vec.multiply(vec);
            let distanceSquared = distanceSquaredVec.x + distanceSquaredVec.y + distanceSquaredVec.z;
            let distance = Math.sqrt(distanceSquared);

            let massProduct = sphereA.physicsImpostor.mass * sphereB.physicsImpostor.mass;
            let magnitude = massProduct / distanceSquared;
            let multiplier = magnitude / distance;

            //vec is force to apply on sphere a that pushes it towards sphere b
            vec.x = vec.x * multiplier;
            vec.y = vec.y * multiplier;
            vec.z = vec.z * multiplier;
            sphereA.physicsImpostor.applyForce(vec, sphereA.getAbsolutePosition());

            //vec is force to apply on sphere b that pushes it towards sphere a
            vec.x = -vec.x;
            vec.y = -vec.y;
            vec.z = -vec.z;
            sphereB.physicsImpostor.applyForce(vec, sphereB.getAbsolutePosition());
        }
    }
});

const actionManager = new BABYLON.ActionManager(scene);
actionManager.registerAction(new BABYLON.ExecuteCodeAction(
    {
        trigger: BABYLON.ActionManager.OnKeyDownTrigger,
        parameter: 'f'
    },
    () => {
        engine.switchFullscreen();
    }
));
scene.actionManager = actionManager;

window.addEventListener('resize', () => {
    engine.resize();
});

function renderLoop() {
    scene.render();
}
engine.runRenderLoop(renderLoop);