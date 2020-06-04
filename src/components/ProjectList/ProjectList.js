import React, { Component, useState } from "react";

import { TweenLite, gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

import image1 from "./image-1.jpg";
import image2 from "./image-2.jpg";
import image3 from "./image-3.jpg";
import image4 from "./image-4.jpg";
import image5 from "./tokyo.jpg";
import image6 from "./berlin.jpg";
import image7 from "./osaka.jpg";
import image8 from "./seoul.jpg";
import image9 from "./pekin.jpg";
import image10 from "./shanghai.jpg";
import image11 from "./xian.jpg";
import image12 from "./guilin.jpg";
import image13 from "./toronto.jpg";
import image14 from "./sanfrancisco.jpg";
import image15 from "./venise.jpg";
import image16 from "./milan.jpg";
import image17 from "./pise.jpg";
import image18 from "./pompei.jpeg";
import image19 from "./naples.jpg";

import "./ProjectList.scss";

gsap.registerPlugin(Draggable, InertiaPlugin);
const containerId = "imageContainer";
const containerSelector = "#" + containerId;
const rowClass = "row"
const rowSelector = "." + rowClass;
const imageClass = "sliderImage";
const imageSelector = "." + imageClass;
const imgURLArray = [ {src: image1, class: "Irlande", titre: "Dublin"},
                      {src: image2, class: "Royaume Unis", titre: "Londres"},
                      {src: image3, class: "Italie", titre: "Rome"},
                      {src: image4, class: "Italie", titre: "Florence"},
                      {src: image5, class: "Japon", titre: "Tokyo"},
                      {src: image6, class: "Allemagne", titre: "Berlin"},
                      {src: image7, class: "Japon", titre: "Osaka"},
                      {src: image8, class: "Corée du Sud", titre: "Seoul"},
                      {src: image9, class: "Chine", titre: "Pekin"},
                      {src: image10, class: "Chine", titre: "Shanghai"},
                      {src: image11, class: "Chine", titre: "Xi'an"},
                      {src: image12, class: "Chine", titre: "Guilin"},
                      {src: image13, class: "Canada", titre: "Toronto"},
                      {src: image14, class: "USA", titre: "San Francisco"},
                      {src: image15, class: "Italie", titre: "Venise"},
                      {src: image16, class: "Italie", titre: "Milan"},
                      {src: image17, class: "Italie", titre: "Pise"},
                      {src: image18, class: "Italie", titre: "Pompeii"},
                      {src: image19, class: "Italie", titre: "Naples"},
                    ];
const imgURLArrayLength = imgURLArray ? imgURLArray.length : -1;
const rowNum = 10;
const imgNum = 30;

const useInertia = true;
const useCenterGrid = true;

let rows,
imgMidIndex,
rowMidIndex;
const rowArray = [];
const imgRep = [];

let boxWidth,
boxHeight,
gutter,
horizSpacing,
vertSpacing,
horizOffset,
vertOffset,
winMidX,
winMidY,
lastCenteredElem;

class projectList extends Component {
  constructor(props) {
    super(props);

    this.myRef = React.createRef();
    this.onFilterChange = this.onFilterChange.bind(this);
    this.state={ show:false, titre: true }
  }

  componentDidMount() {
    this.init();
  };

  init() {
    gsap.set(containerSelector, {willChange: "transform"});

    this.createImageGrid();
    this.createMask();
    lastCenteredElem = document.querySelectorAll(imageSelector)[(rowMidIndex - 1) * imgNum + imgMidIndex];

    this.createDraggable();

    this.setStyles();

    this.resize();
    window.addEventListener("resize", this.resize);
  }

  onFilterChange = (newFilter) => {
    if(newFilter === '*') {
      this.setStyles();
    } else {
      this.setStyles(newFilter);
    }
    this.resize();
  }

  moveArrayIndex(array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
      newIndex = array.length - 1;
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    return array;
  }


  checkPositions(elem) {
    let rowIndex = -1,
    imgIndex = -1;
    imgRep.forEach((row, i) => {
      row.forEach((img, j) => {
        if(elem.isSameNode(img)) {
          rowIndex = i;
          imgIndex = j;
        }
      });
    });

    if(rowIndex === -1)
      return;

    if(rowIndex < rowMidIndex) {
      for(let i = rowIndex; i < rowMidIndex; i++) {
        let rowY = gsap.getProperty(rowArray[0], "y");

        if(rowArray.length % 2 === 1) { 
          let row = rowArray[rowArray.length - 1];
          if(row.dataset.offset === "true") {
            gsap.set(row, {y: rowY - gutter - boxHeight, x: "+=" + boxWidth / 2});
            row.dataset.offset = "false";
          } else {
            gsap.set(row, {y: rowY - gutter - boxHeight, x: "-=" + boxWidth / 2});
            row.dataset.offset = "true";
          }
        } else { 
          gsap.set(rowArray[rowArray.length - 1], {y: rowY - gutter - boxHeight});
        }

        this.moveArrayIndex(imgRep, imgRep.length - 1, 0);
        this.moveArrayIndex(rowArray, rowArray.length - 1, 0);
      }
    } else if(rowIndex > rowMidIndex) {
      for(let i = rowMidIndex; i < rowIndex; i++) {
        let rowY = gsap.getProperty(rowArray[rowArray.length - 1], "y");

        if(rowArray.length % 2 === 1) {
          let row = rowArray[0];
          if(row.dataset.offset === "true") {
            gsap.set(row, {y: rowY + gutter + boxHeight, x: "-=" + boxWidth / 2});
            row.dataset.offset = "false";
          } else {
            gsap.set(row, {y: rowY + gutter + boxHeight, x: "+=" + boxWidth / 2});
            row.dataset.offset = "true";
          }
        } else {
          gsap.set(rowArray[0], {y: rowY + gutter + boxHeight});
        }

        this.moveArrayIndex(imgRep, 0, imgRep.length - 1);
        this.moveArrayIndex(rowArray, 0, rowArray.length - 1);
      }
    }


    if(imgIndex < imgMidIndex) {
      for(let rowNum = 0; rowNum < rows.length; rowNum++) {
        let row = imgRep[rowNum];

        for(let i = imgIndex; i < imgMidIndex; i++) {
          let imgX = gsap.getProperty(row[0], "x");

          gsap.set(row[row.length - 1], {x: imgX - gutter - boxWidth});

          this.moveArrayIndex(row, row.length - 1, 0);
        }
      }
    } else if(imgIndex > imgMidIndex) {
      for(let rowNum = 0; rowNum < rows.length; rowNum++) {
        let row = imgRep[rowNum];

        for(let i = imgMidIndex; i < imgIndex; i++) {
          let imgX = gsap.getProperty(row[imgNum - 1], "x");

          gsap.set(row[0], {x: imgX + gutter + boxWidth});

          this.moveArrayIndex(row, 0, row.length - 1);
        }
      }
    }
  }


  centerGrid = () => {
    let bcr = lastCenteredElem.getBoundingClientRect();
    let midX = bcr.x + bcr.width / 2;
    let midY = bcr.y + bcr.height / 2;

    let x = winMidX - midX;
    let y = winMidY - midY;
    gsap.to(containerSelector, {
      ease: "sine.inOut",
      duration: 0.7,
      x: "+=" + x,
      y: "+=" + y
    });
  }

  getCenterCoords(endX, endY) {
    return {x: winMidX - endX, y: winMidY - endY}
  }

  updateCenterElem = () => {
    let elems = document.elementsFromPoint(winMidX, winMidY);

    elems.forEach(elem => {
      if(elem.matches(imageSelector) && !lastCenteredElem.isSameNode(elem)) {
        lastCenteredElem = elem; 

        this.checkPositions(lastCenteredElem);
      }
    });
  }

  createImageGrid() {
    for(let y = 0; y < rowNum; y++) {
      let row = document.createElement("div");
      row.className = rowClass;
      for(let x = 0; x < imgNum; x++) {
        let image = document.createElement("div");
        let link = document.createElement("a");
        let legend = document.createElement("div");
        legend.className = "Thumb__title";
        link.className = "filter-item styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-small Thumb__layout-horizontal";
        image.className = imageClass;
        row.appendChild(link);
        link.appendChild(image);
        image.appendChild(legend);
      }
      document.querySelector(containerSelector).appendChild(row);

      imgRep.push(gsap.utils.toArray(row.querySelectorAll(imageSelector)));
    }

    rows = document.querySelectorAll(rowSelector);
    imgMidIndex = Math.floor(imgNum / 2);
    rowMidIndex = Math.floor(rowNum / 2);
  }

  createMask() {
    let mask = document.createElement("div");
    mask.className = "mask";
    document.body.appendChild(mask);

    gsap.set(mask, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      borderTop: "25px solid",
      borderBottom: "25px solid",
      zIndex: 9,
    });
  }

  resize() {
    winMidX = window.innerWidth / 2;
    winMidY = window.innerHeight / 2;
    boxWidth = window.innerWidth * 0.35;
    boxHeight = window.innerHeight * 0.35;
    gutter = window.innerWidth * 0.05;
    horizSpacing = boxWidth + gutter;
    vertSpacing = boxHeight + gutter;
    horizOffset = -(imgMidIndex * horizSpacing + boxWidth / 2) + winMidX;
    vertOffset = -(rowMidIndex * vertSpacing + boxHeight / 2) + winMidY;

    gsap.set(containerSelector, {x: 0, y: 0, scale: 0.6});

    rows.forEach(function(row, i) {
      gsap.set(row, {
        attr: { 
          "data-offset": function() {
            if(i % 2 === 0) return false;
            else return true;
          }
        },
        x: function() {
          if(i % 2 === 0)
            return horizOffset;
          else
            return horizOffset - boxWidth / 2;
        },
        y: function() {
          return i * vertSpacing + vertOffset;
        },
      });

      gsap.set(row.querySelectorAll(imageSelector), {
        width: boxWidth,
        height: boxHeight,
        x: function(index) {
          return index * horizSpacing;
        }
      });

      const tl = gsap.timeline();

      tl.from(row.querySelectorAll(imageSelector), {
        scale: 0.2,
        duration: Math.floor(Math.random() * 4) + 1,
        ease: "sine.inOut",
        opacity: 0
      });

      rowArray[i] = row;
    });
  }

  setStyles(param) {
    gsap.set("body", {
      margin: 0,
      overflow: "hidden"
    });

    const randImgSize = Math.floor( Math.max(window.innerWidth, window.innerHeight) / 3);
    gsap.set(imageSelector, {
      backgroundImage: function(index) {
        if (param) {
          const newImages = imgURLArray.filter(element => element.class === param);
          const newImagesArrayLength = newImages ? newImages.length : -1;
          return `url(` + newImages[index % newImagesArrayLength].src + `)`;
        } else {
          return `url(` + imgURLArray[index % imgURLArrayLength].src + `)`;
        }
      },
      position: "absolute",
      backgroundSize: "cover",
      backgroundPosition: "center",
      border: "2px solid #FFF",
      outline: "1px solid #000",
      top: 0,
      left: 0
    });
    let legend = document.querySelectorAll(imageSelector);
    for(let x = 0; x < legend.length; x++) {
      if (param) {
        const newImages = imgURLArray.filter(element => element.class === param);
        const newImagesArrayLength = newImages ? newImages.length : -1;
        legend[x].dataset.pays = newImages[x % newImagesArrayLength].class;
        legend[x].children[0].innerHTML = newImages[x % newImagesArrayLength].titre;
      } else {
        legend[x].dataset.pays = imgURLArray[x % imgURLArrayLength].class;
        legend[x].children[0].innerHTML = imgURLArray[x % imgURLArrayLength].titre;
      }
    }

    gsap.set(rowSelector, {
      position: "absolute"
    });
  }

  imgEffect(elem) {
    gsap.to(imageSelector, {
      duration: 1,
      filter: "grayscale(90%) invert(15%)"
    });

    gsap.to("[data-pays='" + elem + "']", {
      filter: "none",
      overwrite: true
    });
  }

  imgEffectLeave() {
    gsap.to(imageSelector, {
      duration: 1,
      filter: "none",
      overwrite: true
    });
  }

  createDraggable() {
    let options = {
      trigger: ".mask",
      dragResistance: 0.4,
      resistance: 400,
      onDrag: this.updateCenterElem,
      onClick: e => {
        const clicked = document.elementsFromPoint(e.pageX, e.pageY);

        clicked.forEach(elem => {
          if(elem.matches(".sliderImage")) {
            console.log("to", elem)
          }
        });
      },
    }

    if(useInertia) {
      options.inertia = true;
      options.onThrowUpdate = this.updateCenterElem;

      if(useCenterGrid) {
        options.onThrowComplete = this.centerGrid;
      }
    } else if(useCenterGrid) {
      options.onDragEnd = this.centerGrid;
    }
    document.querySelector(".mask").addEventListener("mousemove", (e) => {
      const hover = document.elementsFromPoint(e.pageX, e.pageY);

      hover.forEach(elem => {
        let titreVoyage = document.querySelector("#titreVoyage");
        let titreIntro = document.querySelector("#titreIntro");
        if(elem.matches(".sliderImage")) {
          document.querySelector(".mask").style.cursor = "pointer";

          titreVoyage.innerHTML = "Notre visite à " + elem.innerText;
          titreIntro.classList.add("hidden");
          titreVoyage.classList.remove("hidden");
        } 
      });
    }, {once : false});
    return Draggable.create(containerSelector, options);
  }

  render() {
    const dragInfo = {
      position: 'absolute', 
      bottom: '20%',
    };
    return (
      <React.Fragment>
      {
        this.state.show? 
        <aside className="navAside">
        <div className="contentAside" style={{transform: "translate3d(0px, 0%, 0px)"}}>
        <div>
        <div className="delete">
        <div>
        <svg className="" viewBox="0 0 12 12" onClick={() => {this.setState({show:!this.state.show})}}>
        <path fillRule="evenodd" clipRule="evenodd" fill="black" d="M10.6666 11.9988L11.9999 10.6655L7.33363 5.99922L11.9998 1.33307L10.6665 -0.000240447L6.00032 4.66591L1.33343 -0.000976562L0.000117558 1.33233L4.66701 5.99922L0 10.6662L1.33331 11.9995L6.00032 7.33253L10.6666 11.9988Z">
        </path>
        </svg>
        </div>
        </div>
        <nav>
        <ul>
        <li className="listAside">
        <a data-title="all" style={{opacity: "1"}} onClick={() => {this.onFilterChange("*"); this.setState({show:!this.state.show})}}>
        <div>le monde
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Irlande" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Irlande")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Irlande"); this.setState({show:!this.state.show})}}>
        <div>Irlande
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Allemagne" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Allemagne")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Allemagne"); this.setState({show:!this.state.show})}}>
        <div>Allemagne
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Chine" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Chine")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Chine"); this.setState({show:!this.state.show})}}>
        <div>Chine
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Canada" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Canada")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Canada"); this.setState({show:!this.state.show})}}>
        <div>Canada
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="USA" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("USA")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("USA"); this.setState({show:!this.state.show})}}>
        <div>USA
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Japon" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Japon")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Japon"); this.setState({show:!this.state.show})}}>
        <div>Japon
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Corée du Sud" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Corée du Sud")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Corée du Sud"); this.setState({show:!this.state.show})}}>
        <div>Corée du Sud
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Royaume Unis" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Royaume Unis")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Royaume Unis"); this.setState({show:!this.state.show})}}>
        <div>Royaume Unis
        </div>
        </a>
        </li>
        <li className="listAside">
        <a data-title="Italie" style={{opacity: "1"}} onMouseOver={() => this.imgEffect("Italie")} onMouseOut={() => this.imgEffectLeave()} onClick={() => {this.onFilterChange("Italie"); this.setState({show:!this.state.show})}}>
        <div>Italie
        </div>
        </a>
        </li>
        </ul>
        </nav>
        </div>
        </div>
        </aside> : null
      }
      <nav className="navFiltre">
      <a href="/nous">
      <span style={{transitionDelay: "0.5s"}}>Nous</span>
      </a>
      <span style={{transitionDelay: "0.6s"}}> </span>
      <span style={{transitionDelay: "0.65s"}}>a</span>
      <span style={{transitionDelay: "0.7s"}}>v</span>
      <span style={{transitionDelay: "0.75s"}}>o</span>
      <span style={{transitionDelay: "0.8s"}}>n</span>
      <span style={{transitionDelay: "0.85s"}}>s</span>
      <span style={{transitionDelay: "0.9s"}}> </span>
      <span style={{transitionDelay: "0.95s"}}>v</span>
      <span style={{transitionDelay: "1s"}}>o</span>
      <span style={{transitionDelay: "1.05s"}}>y</span>
      <span style={{transitionDelay: "1.1s"}}>a</span>
      <span style={{transitionDelay: "1.15s"}}>g</span>
      <span style={{transitionDelay: "1.2s"}}>é</span>
      <span style={{transitionDelay: "1.25s"}}> </span>
      <span style={{transitionDelay: "1.3s"}}>d</span>
      <span style={{transitionDelay: "1.35s"}}>a</span>
      <span style={{transitionDelay: "1.35s"}}>n</span>
      <span style={{transitionDelay: "1.35s"}}>s</span>
      <button onClick={() => {this.setState({show:!this.state.show})}}>
      <div>
      </div>
      <span style={{transitionDelay: "1.4s"}}>l</span>
      <span style={{transitionDelay: "1.4s"}}>e</span>
      <span style={{transitionDelay: "1.4s"}}> </span>
      <span style={{transitionDelay: "1.4s"}}>m</span>
      <span style={{transitionDelay: "1.45s"}}>o</span>
      <span style={{transitionDelay: "1.5s"}}>n</span>
      <span style={{transitionDelay: "1.55s"}}>d</span>
      <span style={{transitionDelay: "1.6s"}}>e</span>
      </button>
      </nav>
      <div className="Container__wrapper Container__center">
      <div style={{zIndex: "1"}}>

      <div className="Intro__wrapper">
      <h1 id="titreIntro" className="Heading__wrapper styles__font-size-xl styles__font-family-serif-bold Intro__title">Nos voyages🏝</h1>
      <h1 id="titreVoyage" className="Heading__wrapper styles__font-size-xl styles__font-family-serif-bold hidden"></h1>
      <div className="Heading__wrapper styles__font-size-sm Intro__desc">Retrouvez ici toutes les villes que nous avons visité.</div>
      </div>

      </div>
      <div className="Container__wrapper Container__absolute Container__center">
      </div>
      <div className="Container__wrapper Container__absolute Container__center">
      <div className="Heading__wrapper styles__font-size-xs" style={dragInfo}>DRAG POUR EXPLORER</div>
      <div id="imageContainer" className="filter-container">
      </div>
      </div>
      </div>
      </React.Fragment>
      );
}
}

export default projectList;
