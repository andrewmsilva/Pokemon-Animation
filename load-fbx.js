import * as THREE from './libs/js/three.js/build/three.module.js';
import Stats from './libs/js/three.js/examples/jsm/libs/stats.module.js';

import { OrbitControls } from './libs/js/three.js/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from './libs/js/three.js/examples/jsm/loaders/FBXLoader.js';

let container, stats, controls;
let camera, scene, renderer, mixer, light;
let activeInsaneMode = false;

let clock = new THREE.Clock();

// Audios
let listener = new THREE.AudioListener();
let MagikarpSong = new THREE.Audio(listener);
let JigglypuffSong = new THREE.Audio(listener);
let ArcanineSong = new THREE.Audio(listener);
let SnivySong = new THREE.Audio(listener);
let breakFree = new THREE.Audio(listener);

const KEYS = {
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
}

init();
animate();

function init(){
  // Models structures
  let Jigglypuff = {
    name: 'Jigglypuff',
    rotation: {x:0,y:0,z:0},
    translation: {x:100,y:0,z:-70},
    fbx_path: './src/models/fbx/Jigglypuff/Jigglypuff.FBX',
    texture: './src/models/fbx/Jigglypuff/images_shiny/pm0039_00_Body1.png',
    specularTexture: './src/models/fbx/Jigglypuff/images/pm0039_00_Body2.png',
    music: './libs/audio/Jigglypuff.mp3',
    show: false,
  }

  let Magikarp = {
    name: 'Magikarp',
    rotation: {x:0,y:0,z:0},
    translation: {x:300,y:5,z:-70},
    fbx_path: './src/models/fbx/Magikarp/MagikarpF.FBX',
    texture: './src/models/fbx/Magikarp/images/pm0129_00_Body1.png',
    specularTexture: './src/models/fbx/Magikarp/images/pm0129_00_Body1Id.png',
    music: './libs/audio/Magikarp.mp3',
    show: false,
  }

  let Snivy = {
    name: 'Snivy',
    rotation: {x:0,y:0,z:0},
    translation: {x:-100,y:0,z:-70},
    fbx_path: './src/models/fbx/Snivy/Snivy.FBX',
    texture: './src/models/fbx/Snivy/images/pm0495_00_Body1.png',
    specularTexture: './src/models/fbx/Snivy/images/pm0495_00_Body1Id.png',
    music: './libs/audio/Snivy.mp3',
    show: false,
  }

  let Arcanine = {
    name: 'Arcanine',
    show: false,
    rotation: {x:0,y:0,z:0},
    translation: {x:-300,y:0,z:-70},
    fbx_path: './src/models/fbx/Arcanine/Arcanine.FBX',
    texture: './src/models/fbx/Arcanine/images/pm0059_00_BodyA1.png',
    specularTexture: './src/models/fbx/Arcanine/images/pm0059_00_BodyA1Id.png',
    music: './libs/audio/Arcanine.mp3',
  }

  // Render localization
  container = document.createElement('div');
  document.body.appendChild( container );

  // Camera ajusts
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 0, 200, 300 );

  // Create scene and add lights
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xb3ecff );
  light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set( 0, 200, 0 );
  scene.add( light );
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 100, 0 );
  light.castShadow = true;
  light.shadow.camera.top = 380;
  light.shadow.camera.bottom = -300;
  light.shadow.camera.left = -360;
  light.shadow.camera.right = 360;
  scene.add( light );

  // Create Ground: forest green
  let mesh = new THREE.Mesh( 
    new THREE.PlaneBufferGeometry( 5000, 2000 ),
    new THREE.MeshPhongMaterial({
      color: 0x228B22,
      depthWrite: false,
    })
  );
  mesh.rotation.x = - Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add( mesh );
  
  // Load and add Models to the scene
  loadAddModel(Jigglypuff);
  loadAddModel(Magikarp);
  loadAddModel(Snivy);
  loadAddModel(Arcanine);

  // Load audios
  camera.add(listener);
  loadAudio(Snivy, SnivySong);
  loadAudio(Arcanine, ArcanineSong);
  loadAudio(Jigglypuff, JigglypuffSong);
  loadAudio(Magikarp, MagikarpSong);

  // Music
  let audioLoader = new THREE.AudioLoader();
  audioLoader.load('./libs/audio/BreakFree.mp3', function( buffer ) {
    breakFree.setBuffer( buffer );
    breakFree.setVolume(1);
  });

  // Render Model
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  // Include model on Render localization
  container.appendChild( renderer.domElement);

  // Turn on the controls
  controls = new OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 100, 0 );
  controls.update();
}

// Function to run all render
function animate() {
  if(activeInsaneMode){
    var Arcanine = scene.getObjectByName( "Arcanine" );
    var Jigglypuff = scene.getObjectByName( "Jigglypuff" );
    var Snivy = scene.getObjectByName( "Snivy" );
    var Magikarp = scene.getObjectByName( "Magikarp" );

    rotatePokemons([Jigglypuff, Arcanine, Snivy, Magikarp])
  }
  requestAnimationFrame( animate );

  var delta = clock.getDelta();
  if ( mixer ) mixer.update( delta );

  document.addEventListener("keydown", keyboardCommands, false);
  renderer.render( scene, camera );
}

function loadAddModel(model){
  let loader = new FBXLoader();
  loader.load( model.fbx_path, function ( object ) {
      object.name = model.name;

      // Translations
      object.translateX(model.translation.x);
      object.translateY(model.translation.y+900);
      object.translateZ(model.translation.z);

      // Rotations
      object.rotateX(model.rotation.x);
      object.rotateY(model.rotation.y);
      object.rotateZ(model.rotation.z);

      // Textures
      let textureLoader = new THREE.TextureLoader();
      object.traverse( function ( child ) {
        if ( child.isMesh ) {
          child.material = new THREE.MeshPhongMaterial( {
            color: 0xaaaaaa,
            specular: 0x333333,
            shininess: 15,
            map: textureLoader.load(model.texture),
            specularMap: textureLoader.load(model.specularTexture),
          });
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });

    scene.add( object );
  } );
}

function loadAudio(model, audio){
  let audioLoader = new THREE.AudioLoader();
  audioLoader.load( model.music, function( buffer ) {
    audio.setBuffer( buffer );
    audio.setVolume(1);
  });
}

function keyboardCommands(event){
  var Arcanine = scene.getObjectByName( "Arcanine" );
  var Jigglypuff = scene.getObjectByName( "Jigglypuff" );
  var Snivy = scene.getObjectByName( "Snivy" );
  var Magikarp = scene.getObjectByName( "Magikarp" );
  let keyCode = event.which;

  switch(keyCode){
    case KEYS.ONE:
      if(!Jigglypuff.show && !activeInsaneMode){
        Arcanine.show = !(Arcanine.show);
        showModel(Arcanine);
      }
      break;

    case KEYS.TWO:
      if(!Jigglypuff.show && !activeInsaneMode){
        Snivy.show = !(Snivy.show);
        showModel(Snivy);
      }
      break;

    case KEYS.THREE:
      if(!activeInsaneMode){
        Jigglypuff.show = !(Jigglypuff.show);
        showModel(Jigglypuff);

        if(Jigglypuff.show)
          singJigglypuff([Arcanine, Snivy, Magikarp]);
        else
          wakeUpPokemons([Arcanine, Snivy, Magikarp]);
      }
      break;

    case KEYS.FOUR:
      if(!Jigglypuff.show && !activeInsaneMode){
        Magikarp.show = !(Magikarp.show);
        showModel(Magikarp);
      }
      break;

    case KEYS.FIVE:
      SnivySong.pause();
      MagikarpSong.pause();
      ArcanineSong.pause();
      JigglypuffSong.pause();
      break;

    case KEYS.SIX:
      if(!activeInsaneMode){
        SnivySong.pause();
        MagikarpSong.pause();
        ArcanineSong.pause();
        JigglypuffSong.pause();
        breakFree.play();

        activeInsaneMode = true;
        insaneMode();
      }
      break;
  }
}

function showModel(model){
  let song = model.name + 'Song';
  if(model.show){
    if(!activeInsaneMode) eval(song).play();
    model.translateY(-900);
  } else {
    eval(song).pause();
    model.translateY(900);
  }
}

function singJigglypuff(pokemons){
  pokemons.map( pokemon => {
    let song = pokemon.name + 'Song';
    if(pokemon.show){
      eval(song).pause();
      pokemon.rotateZ(1.5);
    }
  })
}

function wakeUpPokemons(pokemons){
  pokemons.map( pokemon => {
    let song = pokemon.name + 'Song';
    if(pokemon.show){
      if(!activeInsaneMode)
        eval(song).play();
      pokemon.rotateZ(-1.5);
    }
  })
}

function insaneMode(){
  //if(activeInsaneMode){

    // Dancers
    let dancerLoader = new FBXLoader();
    dancerLoader.load( './src/models/fbx/Dancer/Hip-Hop-Dancing.fbx', function ( object ) {
        mixer = new THREE.AnimationMixer( object );
        var action = mixer.clipAction( object.animations[ 0 ] );
        action.play();
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        }
        );
        object.name = "HipHop";
        scene.add( object );
    } );

    dancerLoader.load( './src/models/fbx/Dancer/Capoeira.fbx', function ( object ) {
      mixer = new THREE.AnimationMixer( object );
      var action = mixer.clipAction( object.animations[ 0 ] );
      action.play();
      object.traverse( function ( child ) {
          if ( child.isMesh ) {
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });
      object.translateZ(-200);
      object.name = "Capoeira"
      scene.add( object );
    });

    dancerLoader.load( './src/models/fbx/Dancer/Samba Dancing.fbx', function ( object ) {
      mixer = new THREE.AnimationMixer( object );
      var action = mixer.clipAction( object.animations[ 0 ] );
      action.play();
      object.traverse( function ( child ) {
          if ( child.isMesh ) {
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });
      object.translateZ(-200);
      object.translateX(100);
      object.name = "Samba"
      scene.add( object );
    });

    // Runner
    let runnerLoader = new FBXLoader();
    runnerLoader.load( './src/models/fbx/Dancer/Running.fbx', function ( object ) {
        mixer = new THREE.AnimationMixer( object );
        var action = mixer.clipAction( object.animations[ 0 ] );
        action.play();
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        }
        );
        object.translateX(200);
        object.translateZ(-1200);
        object.name = "Running";
        object.rotateY(0.5);
        scene.add( object );
    });

    // Sphere
    var geometry = new THREE.SphereGeometry( 150, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00aaff} );
    var sphere = new THREE.Mesh( geometry, material );

    sphere.translateX(100);
    sphere.translateY(150);
    sphere.translateZ(-800);

    scene.add( sphere );

  /*} else {
    scene.remove(scene.getObjectByName("Samba"));
    scene.remove(scene.getObjectByName("HipHop"));
    scene.remove(scene.getObjectByName("Capoeira"));
  }*/
}

function rotatePokemons(pokemons){
  pokemons.map( pokemon => {
    if(!pokemon.show) {
      pokemon.show = true;
      showModel(pokemon);
    }
    pokemon.rotation.y += 0.1;
  })
}