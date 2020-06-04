import React, { Component, useState } from "react";
import { TweenLite, gsap } from "gsap";
import {Curtains} from 'curtainsjs';
import Draggabilly from 'draggabilly';
import image3 from "../ProjectList/image-3.jpg";
import image5 from "../ProjectList/tokyo.jpg";
import image6 from "../ProjectList/berlin.jpg";
import image8 from "../ProjectList/seoul.jpg";
import image12 from "../ProjectList/guilin.jpg";
import image13 from "../ProjectList/toronto.jpg";
import image14 from "../ProjectList/sanfrancisco.jpg";
import image1 from "../ProjectList/image-1.jpg";
import image2 from "../ProjectList/image-2.jpg";

import "./Index.scss";

class Index extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  	const webGLCurtain = new Curtains("canvas");

const planeContainer = document.querySelector(".planes");
const planeElements = planeContainer.querySelectorAll(".plane");
const draggableHidden = planeContainer.querySelector(".draggable-hidden");
const draggableVisible = planeContainer.querySelector(".draggable-visible");
const sliderNamesContainer = planeContainer.querySelector(
  ".slider-names-container"
);
const sliderNames = planeContainer.querySelector(".slider-names");
const names = planeContainer.querySelectorAll(".slider__name");
const items = planeContainer.querySelectorAll(".item");
const draggie = new Draggabilly(draggableHidden, { axis: "x" });

sliderNamesContainer.style.height = names[0].getBoundingClientRect().height + "px"

const width = window.innerWidth;

let mouse = {
  initPosX: 0,
  finalPosX: 0,
  currentPosX: 0,
  previousPosX: 0,
  minPosX: 0,
  maxPosX: width - draggableHidden.getBoundingClientRect().width,
  isMouseDown: false
};

let sliderNamesProps = {
  containerHeight:
    sliderNamesContainer.getBoundingClientRect().height -
    sliderNames.getBoundingClientRect().height 
};

let start = performance.now();
let acceleration = 0;
let lastAcceleration = 0;
let posNames = 0;
let lastPosNames = 0;
let amplitude = 0.1;
let lastMouse = 0;
let easing = 0.05;
let cancelAnimation = true;
let isOut = false;

const planes = [];

const MathUtils = {
  lerp: (a, b, n) => (1 - n) * a + n * b,
  map_range: (value, low1, high1, low2, high2) => {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }
};

// Create canvas
const createCanvas = () => {
  const shader = {
    vertex: `    
    #ifdef GL_ES
    precision mediump float;
    #endif
    
    #define PI 3.14159265359
    
    // those are the mandatory attributes that the lib sets
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    // those are mandatory uniforms that the lib sets and that contain our model view and projection matrix
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    uniform mat4 planeTextureMatrix;

    // if you want to pass your vertex and texture coords to the fragment shader
    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;

    varying float vDirection;

    uniform float uDirection;

    void main() {
        vec3 position = aVertexPosition;

        float x = sin((position.y * 0.5 - 0.5) * PI) * uDirection;

        position.x -= x;
        
        gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);

        // set the varyings
        vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0., 1.)).xy;
        vVertexPosition = position;

        vDirection = uDirection;
    }`,
    fragment: `
    #ifdef GL_ES
    precision mediump float;
    #endif

    #define PI2 6.28318530718
    #define PI 3.14159265359
    #define S(a,b,n) smoothstep(a,b,n)
    
    // get our varyings
    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;

    // the uniform we declared inside our javascript
    uniform float uTime;

    // our texture sampler (default name, to use a different name please refer to the documentation)
    uniform sampler2D planeTexture;
    
    varying float vDirection;

    void main(){
        vec2 uv = vTextureCoord;

        float x = uv.y * PI2/.5 + uTime * 3.; 
        float y = uv.x * PI2/.5 + uTime * 3.;

        float distX = cos(x+y) * .01 * cos(y);
        float distY = sin(x-y) * .01 * cos(y);

        vec2 distPosition = vec2(distX, distY);

        float scale = -abs(vDirection) * 0.8;

        uv = (uv - 0.5) * scale + uv;

        float r = texture2D(planeTexture, vec2(uv.x - vDirection * 0.1, uv.y)).r;
        float g = texture2D(planeTexture, vec2(uv.x - vDirection * 0.4, uv.y)).g;
        float b = texture2D(planeTexture, vec2(uv.x - vDirection * 0.4, uv.y)).b;
        
        gl_FragColor = vec4(r, g, b, 1.0);  
    }
    `
  };

  const params = {
    vertexShader: shader.vertex, // our vertex shader ID
    fragmentShader: shader.fragment, // our framgent shader ID
    widthSegments: 40,
    heightSegments: 40, // we now have 40*40*6 = 9600 vertices !
    uniforms: {
      time: {
        name: "uTime",
        type: "1f",
        value: 0
      },
      direction: {
        name: "uDirection",
        type: "1f",
        value: 0
      }
    }
  };

  webGLCurtain.disableDrawing();

  // create our plane mesh

  for (let i = 0; i < planeElements.length; i++) {
    const plane = webGLCurtain.addPlane(planeElements[i], params);
    startPlane(items[i], plane);
  }

  initEvents();
  requestAnimationFrame(onUpdate);
};

const startPlane = (planeElement, plane) => {
  plane
    .onLoading(() => {
      plane.mouseOver = false;

      planeElement.addEventListener("mouseenter", () => {
        plane.mouseOver = true;
        webGLCurtain.enableDrawing();
      });

      planeElement.addEventListener("mouseleave", () => {
        plane.mouseOver = false;
      });

      webGLCurtain.needRender();
    })
    .onRender(() => {
      //plane.uniforms.time.value = plane.mouseOver ? plane.uniforms.time.value + 1 : 0
      plane.uniforms.direction.value = lastAcceleration;

      plane.updatePosition();
    })
    .onLeaveView(() => {
      //console.log("leaving view", plane.index);
    })
    .onReEnterView(() => {
      //console.log("entering view", plane.index);
    });
};

const onUpdate = () => {
  if (!cancelAnimation) {
    const { lerp } = MathUtils;
    const now = performance.now();

    const acceleration =
      ((mouse.currentPosX - lastMouse) / (now - start)) * amplitude;

    lastAcceleration = lerp(lastAcceleration, acceleration, easing);

    start = now;
    lastMouse = mouse.currentPosX;

    mouse.previousPosX = lerp(mouse.previousPosX, mouse.currentPosX, easing);

    draggableVisible.style.transform = `translate3d(${mouse.previousPosX}px, 0, 0)`;

    posNames =
      (draggie.position.x / mouse.maxPosX) * sliderNamesProps.containerHeight;

    lastPosNames = lerp(lastPosNames, posNames, easing);
    
    //console.log(posNames,lastPosNames, mouse.maxPosX)

    sliderNames.style.transform = `translate3d(0,${lastPosNames}px,0)`;

    if (Math.round(mouse.previousPosX) === mouse.currentPosX) {
      webGLCurtain.disableDrawing();
      cancelAnimation = true;
    }
  }

  requestAnimationFrame(onUpdate);
};

// Drag element
const onDragMove = () => {
  cancelAnimation = false;
  webGLCurtain.enableDrawing();

  // Si esta en el limite se trasladara la mitad del ancho del viewport
  if (draggie.position.x > mouse.minPosX) {
    mouse.currentPosX = MathUtils.map_range(
      draggie.position.x,
      0,
      window.innerWidth,
      0,
      window.innerWidth / 3
    );
  } else if (draggie.position.x < mouse.maxPosX) {
    mouse.currentPosX = MathUtils.map_range(
      draggie.position.x,
      mouse.maxPosX,
      mouse.maxPosX - window.innerWidth,
      mouse.maxPosX,
      mouse.maxPosX - window.innerWidth / 3
    );
  } else {
    mouse.currentPosX = draggie.position.x;

    easing = 0.05;
  }

  amplitude = 0.1;
};

const onDragStart = (e) => {
  planeContainer.style.cursor = "grabbing"; // Aplica el curso con icono de agarrando;
};

const onDragEnd = () => {
  planeContainer.style.cursor = "grab"; // Aplica el curso con icono de agarrar

  // Si esta en el limite volvera a su posicion inicial o final
  if (draggie.position.x > mouse.minPosX) {
    mouse.currentPosX = 0;
    draggie.setPosition(mouse.currentPosX, draggie.position.y);
    amplitude = 0;
    easing = 0.5;
  } else if (draggie.position.x < mouse.maxPosX) {
    mouse.currentPosX = mouse.maxPosX;
    draggie.setPosition(mouse.currentPosX, draggie.position.y);
    amplitude = 0;
    easing = 0.5;
  } else {
    draggie.setPosition(mouse.currentPosX, draggie.position.y);
  }
};

// Al reescalar calcula denuevo la posicion maxima
const onResize = () => {
  sliderNamesContainer.style.height = names[0].getBoundingClientRect().height + "px"
  
  mouse.maxPosX =
    window.innerWidth - draggableHidden.getBoundingClientRect().width;

  sliderNamesProps = {
    containerHeight:
      sliderNamesContainer.getBoundingClientRect().height -
      sliderNames.getBoundingClientRect().height
  };
};

const initEvents = () => {
  draggie.on("dragMove", () => {
    if (isOut) return;
    onDragMove();
  });
  draggie.on("pointerDown", () => {
    isOut = false;
    onDragStart();
  });
  draggie.on("pointerUp", onDragEnd);

  planeContainer.addEventListener("mouseleave", () => {
    isOut = true;
    onDragEnd();
  });
 
  window.addEventListener("resize", onResize);
};

window.addEventListener("load", createCanvas);

  };

  render() {
    return (
      <React.Fragment>
      	<div id="wrap-texture">

  <div id="canvas"></div>
  <div className="planes">
    <div className="draggable-container">
      
      <div className="slider-names-container">
        <div className="slider-names">
          <div className="slider__name">Italie</div>
          <div className="slider__name">Allemagne</div>
          <div className="slider__name">Japon</div>
          <div className="slider__name">Corée du Sud</div>
          <div className="slider__name">Irlande</div>
          <div className="slider__name">Chine</div>
          <div className="slider__name">Royaume Unis</div>
          <div className="slider__name">USA</div>
          <div className="slider__name">Canada</div>
        </div>
      </div>
      
      <div className="draggable-hidden">
        <div className="item"></div>
        <div className="item"></div>
        <div className="item"></div>
        <div className="item"></div>
        <div className="item"></div>
        <div className="item"></div>
        <div className="item"></div>
        <div className="item"></div>
        <div className="item"></div>
      </div>
      
      <div className="draggable-visible">
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image3} /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image6} crossOrigin="anonymous" /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image5} crossOrigin="anonymous" /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image8} crossOrigin="anonymous" /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image1} crossOrigin="anonymous" /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image12} crossOrigin="anonymous" /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image2} crossOrigin="anonymous" /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image14} crossOrigin="anonymous" /></div>
        <div className="plane"><img data-sampler="planeTexture" className="texture" src={image13} crossOrigin="anonymous" /></div>
      </div>
    </div>
  </div>
</div>
      </React.Fragment>
      );
}
}

export default Index;