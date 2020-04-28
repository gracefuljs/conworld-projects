import * as THREE from "three";

const scene = new THREE.Scene();

/*We'll use the Orthographic Camera instead so that the globe won't
distort due to perspective.*/

const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2, //left
      window.innerWidth / 2, //right
      window.innerHeight / 2, //top
      window.innerHeight / -2, //bottom
      0.1, //near
      1000 //far
    );

const renderer = new THREE.WebGLRenderer();

//set the renderer size to full screen and add to the document body
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//create a geometry that contains all the verticies and faces that
let sphereGeometry = new THREE.SphereGeometry(
	150, //radius: float 
	32, //widthSegments: the number of horizontal segments
	32//heightSegments: the number of vertical segments
);//there are more, but these are all that are required

//asynchronously load a texture
const texture = new THREE.TextureLoader().load("images/world_map.jpg")

//create a basic "skin" for the geometry
const material = new THREE.MeshBasicMaterial({map:texture});

//combine the geometry and skin together to get a finished object, called a Mesh
const globe = new THREE.Mesh(sphereGeometry, material);

//add it to the scene. Default coordinates (0, 0, 0)
scene.add(globe);

//since the camera position defaults to (0, 0, 0) as well, move it a bit so it and 
//the mesh aren't on top of each other
camera.position.z = 500;

//nothing is rendered until the render method on the renderer is called
function animate(){
	//make an animation loop
	requestAnimationFrame(animate);
	globe.rotation.y += 0.005;
	renderer.render(scene, camera);
}

animate()