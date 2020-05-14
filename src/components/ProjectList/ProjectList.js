import React, { Component, useState } from "react";
import { TweenLite, gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import image1 from "./image-1.jpg";
import image2 from "./image-2.jpg";
import image3 from "./image-3.jpg";
import image4 from "./image-4.jpg";

import "./ProjectList.scss";

gsap.registerPlugin(Draggable);
const containerId = "lib__wrapper";
const containerSelector = "." + containerId;
const rowClass = "row";
const rowSelector = "." + rowClass;
const imageClass = "lib__item";
const imageSelector = "." + imageClass;
const rowNum = 5;
const imgNum = 9;
const imgURLArray = null;
const imgURLArrayLength = imgURLArray ? imgURLArray.length : -1;

const useInertia = true;
const useCenterGrid = true;

let rows, imgMidIndex, rowMidIndex;
const rowArray = [];
const imgRep = [];

let boxWidth,
  boxHeight,
  innerWidth,
  innerHeight,
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
  }

  componentDidMount() {
    gsap.set(containerSelector, { willChange: "transform" });
  
    this.createMask();
    
    this.createDraggable();
        
    this.resize();
    window.addEventListener("resize", this.resize);
  };

  moveArrayIndex(array, oldIndex, newIndex) {
      if (newIndex >= array.length) {
          newIndex = array.length - 1;
      }
      array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
      return array;
  }


  checkPositions(elem) {
  // Find the location in our array of the element
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
  
  // Element not found, return
    if(rowIndex === -1)
      return;
    
    // Reposition elements as necessary so that our element is in the center
    // Reposition the rows as necessary
    if(rowIndex < rowMidIndex) {
      for(let i = rowIndex; i < rowMidIndex; i++) {
        // Update the row's actual position
        let rowY = gsap.getProperty(rowArray[0], "y");
        
        if(rowArray.length % 2 === 1) { // Odd number of rows means we have to handle offset
          let row = rowArray[rowArray.length - 1];
          if(row.dataset.offset === "true") {
            gsap.set(row, {y: rowY - gutter - boxHeight, x: "+=" + boxWidth / 2});
            row.dataset.offset = "false";
          } else {
            gsap.set(row, {y: rowY - gutter - boxHeight, x: "-=" + boxWidth / 2});
            row.dataset.offset = "true";
          }
        } else { // Equal number of rows; don't have to handle offset
          gsap.set(rowArray[rowArray.length - 1], {y: rowY - gutter - boxHeight});
        }
        
        // Update our representations
        this.moveArrayIndex(imgRep, imgRep.length - 1, 0);
        this.moveArrayIndex(rowArray, rowArray.length - 1, 0);
      }
    } else if(rowIndex > rowMidIndex) {
      for(let i = rowMidIndex; i < rowIndex; i++) {
        // Update the row's actual position
        let rowY = gsap.getProperty(rowArray[rowArray.length - 1], "y");
        
        if(rowArray.length % 2 === 1) { // Odd number of rows means we have to handle offset
          let row = rowArray[0];
          if(row.dataset.offset === "true") {
            gsap.set(row, {y: rowY + gutter + boxHeight, x: "-=" + boxWidth / 2});
            row.dataset.offset = "false";
          } else {
            gsap.set(row, {y: rowY + gutter + boxHeight, x: "+=" + boxWidth / 2});
            row.dataset.offset = "true";
          }
        } else { // Equal number of rows; don't have to handle offset
          gsap.set(rowArray[0], {y: rowY + gutter + boxHeight});
        }
        
        // Update our representations
        this.moveArrayIndex(imgRep, 0, imgRep.length - 1);
        this.moveArrayIndex(rowArray, 0, rowArray.length - 1);
      }
    }
  
  
    // Reposition the images as necessary
    if(imgIndex < imgMidIndex) {
      for(let rowNum = 0; rowNum < rows.length; rowNum++) { // Do it for every row
        let row = imgRep[rowNum];
        
        for(let i = imgIndex; i < imgMidIndex; i++) {
          // Update the images's actual position
          let imgX = gsap.getProperty(row[0], "x");

          gsap.set(row[row.length - 1], {x: imgX - gutter - boxWidth});

          // Update our representation
          this.moveArrayIndex(row, row.length - 1, 0);
        }
      }
    } else if(imgIndex > imgMidIndex) {
      for(let rowNum = 0; rowNum < rows.length; rowNum++) { // Do it for every row
        let row = imgRep[rowNum];
        
        for(let i = imgMidIndex; i < imgIndex; i++) {
          // Update the images's actual position
          let imgX = gsap.getProperty(row[imgNum - 1], "x");

          gsap.set(row[0], {x: imgX + gutter + boxWidth});

          // Update our representation
          this.moveArrayIndex(row, 0, row.length - 1);
        }
      }
    }
  }


  centerGrid() {
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

  updateCenterElem() {
    let elems = document.elementsFromPoint(winMidX, winMidY);
    elems.forEach(elem => {
      if(elem.matches(imageSelector) && !lastCenteredElem.isSameNode(elem)) {
        lastCenteredElem = elem; 
        
        this.checkPositions(lastCenteredElem);
      }
    });
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
      zIndex: 9999,
    });
  }

  resize() {
    winMidX = innerWidth / 2;
    winMidY = innerHeight / 2;
    boxWidth = innerWidth * 0.35;
    boxHeight = innerHeight * 0.35;
    gutter = innerWidth * 0.05;
    horizSpacing = boxWidth + gutter;
    vertSpacing = boxHeight + gutter;
    horizOffset = -(imgMidIndex * horizSpacing + boxWidth / 2) + winMidX;
    vertOffset = -(rowMidIndex * vertSpacing + boxHeight / 2) + winMidY;
    
    // Reset our container and rows
    gsap.set(containerSelector, {x: 0, y: 0, rotate: 30});
    let imgNum = document.querySelectorAll(imageSelector);
    for (var i = 0; i < imgNum.length; i++) {
        gsap.set(imgNum[i], {
          x: function() {
              return 0;
          },
          y: function() {
            return 0;
          },
        });
    }

    var callback = function (entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // play the individual target.timeline
          entry.target.timeline.play();
        } else {
          //entry.target.timeline.pause(0);
        }
      });
    };

    var options = {
      threshold: 0.6, // target 'section' should be 60% visible
      rootMargin: '0px 0px -40% 0px'
      //rootMargin isn't active in a normal CodePen.
      //Change View: use DebugMode
    };

    var observer = new IntersectionObserver(callback, options);
    var targets = document.querySelectorAll(imageSelector);

    // a loop: create the individual target timelines
    targets.forEach(function(target) {
      console.log(target)
      var ww = window.innerWidth + 300;
      var action = gsap.timeline({paused:false})
      .to(target, {
        duration: 10, 
        x:ww, 
        ease: "sine.inOut", 
        repeat: -1
      });
      
      target.timeline = action;
    });

    Array.prototype.forEach.call(targets, (el) => {observer.observe(el);});  
    
  }

  createDraggable() {
    let options = {
      trigger: ".mask",
      dragResistance: 0.4,
      resistance: 400,
      rotate: 45,
    }
    
    if(useInertia) {
      options.inertia = true;
    }
        
    return Draggable.create(imageSelector, options);
  }

  mouseMove = e => {
    TweenLite.to(this.myRef.current, 0.5, {
      css: {
        left: e.pageX,
        top: e.pageY
      },
      delay: 0.03
    });
  };

  changeBackground(e) {
    console.log(e.target)
    e.target.style.background = 'red';
  }

  handleMouseEnter = () => {
    TweenLite.to(this.myRef.current, 0, {
      css: {
        opacity: "1"
      }
    });
  };

  handleMouseLeave = () => {
    TweenLite.to(this.myRef.current, 0, {
      css: {
        opacity: "0"
      }
    });
  };

  onHover = e => {
    if (e.target.className === "lib__item") {
      TweenLite.to(this.myRef.current, 0, {
        css: { "background-image": "url(" + image1 + ")" }
      });
    }
    if (e.target.className === "project p-2") {
      TweenLite.to(this.myRef.current, 0, {
        css: { "background-image": "url(" + image2 + ")" }
      });
    }
    if (e.target.className === "project p-3") {
      TweenLite.to(this.myRef.current, 0, {
        css: { "background-image": "url(" + image3 + ")" }
      });
    }
    if (e.target.className === "project p-4") {
      TweenLite.to(this.myRef.current, 0, {
        css: { "background-image": "url(" + image4 + ")" }
      });
    }
  };

  render() {
    const dragInfo = {
      position: 'absolute', 
      bottom: '20%',
    };
    return (
      <React.Fragment>
        <div className="Container__wrapper Container__center">
          <div>
            <div className="Intro__wrapper">
              <h1 className="Heading__wrapper styles__font-size-xl styles__font-family-serif-bold Intro__title">Nos voyages🏝</h1>
              <div className="Heading__wrapper styles__font-size-sm Intro__desc">Retrouvez ici toutes les villes que nous avons visité.</div>
            </div>
          </div>
          <div className="Container__wrapper Container__absolute Container__center"></div>
          <div className="Container__wrapper Container__absolute Container__center">
              <div className="Heading__wrapper styles__font-size-xs" style={dragInfo}>DRAG POUR EXPLORER</div>
              <div className="lib__wrapper ">
                <div className="lib__item" onMouseOver={this.changeBackground}>
                  <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                    <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                    <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                    </div>
                  </a>
                </div>
                  <div className="lib__item" onMouseOver={this.changeBackground}>
                    <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                      <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                      <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                      </div>
                    </a>
                  </div>
                  <div className="lib__item" onMouseOver={this.changeBackground}>
                    <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                      <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                      <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                      </div>
                    </a>
                  </div>
                  <div className="lib__item" onMouseOver={this.changeBackground}>
                    <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                      <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                      <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                      </div>
                    </a>
                  </div>
                  <div className="lib__item" onMouseOver={this.changeBackground}>
                    <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                      <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                      <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                      </div>
                    </a>
                  </div>
                  <div className="lib__item" onMouseOver={this.changeBackground}>
                    <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                      <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                      <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                      </div>
                    </a>
                  </div>
                  <div className="lib__item" onMouseOver={this.changeBackground}>
                    <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                      <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                      <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                      </div>
                    </a>
                  </div>
                  <div className="lib__item" onMouseOver={this.changeBackground}>
                    <a data-hide-cursor="true" className="styles__font-size-xs styles__font-family-sans-serif styles__double-border Thumb__wrapper Thumb__size-medium Thumb__layout-horizontal" draggable="false" href="/postcards/my-week">
                      <img className="Thumb__cover" alt="My week by Raffaele Filiberti — sabato.studio" draggable="false" src={image1}/>
                      <div className="Thumb__title">My week by Raffaele Filiberti — sabato.studio
                      </div>
                    </a>
                  </div>
              </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default projectList;
