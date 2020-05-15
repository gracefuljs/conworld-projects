import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

/*We'll use the Orthographic Camera instead so that the globe won't
distort due to perspective.*/

/*This set up will put the origin of the projection grid in the center of the screen, 
with left and bottom being the negative axis and right top being positive.
-If we wanted the origin at the top left corner, then set the left and top to 0 and the right and bottom to the container's width.*/
const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2, //left side of the projection box
      window.innerWidth / 2, //right side
      window.innerHeight / 2, //top
      window.innerHeight / -2, //bottom
      0.1, //near
      1000 //far
    );

//the camera position defaults to (0, 0, 0), so move it a bit along the z-axis so it and 
//the rest of the scene aren't on top of each other
camera.position.set( 0, 0, 500 );//since we're using an orthographic camera, the actual distance from the camera doesn't matter.


const renderer = new THREE.WebGLRenderer();

//set the renderer size to full screen and 
renderer.setSize( window.innerWidth, window.innerHeight);

//set the renderer to the device's pixel ratio to keep the image crisp across all devices
renderer.setPixelRatio( window.devicePixelRatio );

//add to the document body
document.body.appendChild(renderer.domElement);



//Give the ability resize the renderer when the window is resized.

//the 'onResize' event listener is only on the window object, so we'll put the callback on that. 
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
	//for perspective cameras, we would use camera.aspect to change the aspect ratio,
	//but since orthographic cameras don't need to work that way, we need to set the coordinates of each corner manually
	camera.left   = window.innerWidth  / -2;
    camera.right  = window.innerWidth  /  2;
    camera.top    = window.innerHeight /  2;
    camera.bottom = window.innerHeight / -2;

	//apply the above changes to our camera's projection.
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

//create a geometry that contains all the verticies and faces that
let sphereGeometry = new THREE.SphereBufferGeometry(
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


//------------- Making the globe interactive-------------------//

//adding orbit controls to allow the camera to rotate the globe
//we'll replace this later in order to rotate the actual globe
let controls = new OrbitControls(camera, renderer.domElement);

//when the globe is clicked, it stops spinning for roughly 10 seconds
//since we will put this on the animate function, which is called roughly 60
//times a second, we will need a count of 600 for 10 seconds
const GLOBESTOPTIME = 600;

//for our mousedown function to know if what we clicked is actually the globe
let selectedObject = null;

//track when the mouse is clicked and how long it's been since it was clicked
let globeClicked = false;
let timeSinceClicked = 0;

//We'll be using the raycasting method to figure out if the mouse clicked on an object
let mouseRaycaster = new THREE.Raycaster();
let mousePos = new THREE.Vector2()

//track the mouse position with mouse movements
function onMouseMove(event){
	//calculate the normalized version of the mouse coordinates
	mousePos.x = (event.clientX / window.innerWidth)  *  2 - 1;
	mousePos.y = (event.clientY / window.innerHeight) * -2 + 1;
};

function onMouseDown(event){
	if(selectedObject){
		globeClicked = true;
		timeSinceClicked = 0;
	};
};


function elapseClickTimer(){
	if(!globeClicked) return;
	
	if( timeSinceClicked >= GLOBESTOPTIME ){
		globeClicked = false;
		timeSinceClicked = 0;
	}

	else{
		timeSinceClicked ++
	}
}

function selectObject(){
	
	//cast a ray from the camera through the projection box
	mouseRaycaster.setFromCamera(mousePos, camera);
	
	//get a list of objects that the ray intersected.
	let intersectedObjects = mouseRaycaster.intersectObjects(scene.children);

	//if there are any objects in the list
	if(intersectedObjects.length > 0){
		//pick the first object, since it what the ray intersected first and therefore the closest
		selectedObject = intersectedObjects[0].object;
	}

	else{

		selectedObject = null;
	}
};


window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("mousedown", onMouseDown, false);

//-------------------Begin Rendering---------------------------//

//nothing is rendered until the render method on the renderer is called
function animate(){
	//run the raycaster script
	selectObject();

	//make an animation loop
	requestAnimationFrame(animate);
	
	if(!globeClicked){
		//remember, this unit isn't pixels.
		globe.rotation.y += 0.005;
	}

	elapseClickTimer();

	renderer.render(scene, camera);
};

//start animating
animate();

console.log(scene.children)