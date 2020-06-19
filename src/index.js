import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


//--------------------Init--------------------------//
const scene = new THREE.Scene();

//camera variables
const cameraLeft  = window.innerWidth  / -2;
const cameraRight = window.innerWidth  / 2;
const cameraUp    = window.innerHeight / 2;
const cameraDown  = window.innerHeight / -2;
const cameraNear  = 0.1;
const cameraFar   = 1000;

const camera = new THREE.OrthographicCamera(cameraLeft, cameraRight, cameraUp, cameraDown, cameraNear, cameraFar);
camera.position.set( 0, 0, 500 );

//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );


//add renderer to the document
document.body.appendChild(renderer.domElement);


//controls
const controls = new OrbitControls(camera, renderer.domElement);


//create globe
let sphereGeometry = new THREE.SphereBufferGeometry(150, 32, 32);
const texture  = new THREE.TextureLoader().load("images/world_map.jpg");
const material = new THREE.MeshBasicMaterial({map:texture});
const globe    = new THREE.Mesh(sphereGeometry, material);

scene.add(globe);

//globe variables
const GLOBESTOPTIME = 60; //roughly 1 second, in frames (60fps * 1)
let selectedObject  = null;
let globeClicked    = false;
let pausedTimeLeft  = 0;
let globePaused     = false;
let infoCardVisible = false;


function onWindowResize(){
	camera.left   = window.innerWidth  / -2;
    camera.right  = window.innerWidth  /  2;
    camera.top    = window.innerHeight /  2;
    camera.bottom = window.innerHeight / -2;

	//apply the above changes to our camera's projection.
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}



//--------------------Making The GUI----------------------//

const infoCard = document.createElement("div");
infoCard.classList.add("info-card", "hidden");

document.body.appendChild(infoCard);  


function showInfoCard(country="Globe"){
	let info = country;
	infoCard.innerHTML = info;
	infoCard.classList.remove("hidden");
	infoCardVisible = true;
}

function hideInfoCard(){
	infoCard.classList.add("hidden");
	infoCardVisible = false;
}



//-----------------------User Interaction------------------------------------//
let mouseRaycaster = new THREE.Raycaster();
let mousePos = new THREE.Vector2();
let isMouseDown = false;
let checkMouseDown = null;

//track the mouse position with mouse movements
function onMouseMove(event){
	//calculate the normalized version of the mouse coordinates
	mousePos.x = (event.clientX / window.innerWidth)  *  2 - 1;
	mousePos.y = (event.clientY / window.innerHeight) * -2 + 1;
};

function activateMoveGlobe(){
	isMouseDown = true;
}

function deactivateMoveGlobe(){
	globePaused = true;
	pausedTimeLeft = GLOBESTOPTIME;
	isMouseDown = false;
}

function onMouseDown(event){
	if(selectedObject){
		globeClicked = true;
		checkMouseDown = setTimeout(activateMoveGlobe, 300);
	}
};

function onMouseUp(event){
	clearTimeout(checkMouseDown);
	deactivateMoveGlobe();
}

// function onMouseDown(event){
// 	if(selectedObject){
// 		globeClicked = true;
// 		timeSinceClicked = 0;
// 		showInfoCard("Test");
// 	}

// 	else if(infoCardVisible){
// 		hideInfoCard();
// 	}
// };


function elapseClickTimer(){
	if(!globePaused || isMouseDown) return;
	
	if( pausedTimeLeft <= 0 ){
		globeClicked = false;
		pausedTimeLeft = 0;
		globePaused = false;
	}

	else{
		pausedTimeLeft --;
	}
}

function selectObject(){

	mouseRaycaster.setFromCamera(mousePos, camera);
	
	let intersectedObjects = mouseRaycaster.intersectObjects(scene.children);

	if(intersectedObjects.length > 0){
		selectedObject = intersectedObjects[0].object;
	}

	else{

		selectedObject = null;
	}
};


window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("mousedown", onMouseDown, false);
window.addEventListener("mouseup", onMouseUp, false);
window.addEventListener('resize', onWindowResize, false);




//-------------------Begin Rendering---------------------------//

function animate(){
	selectObject();
	requestAnimationFrame(animate);
	
	if(!globeClicked){
		globe.rotation.y += 0.005;
	}

	elapseClickTimer();

	renderer.render(scene, camera);
};

animate();
