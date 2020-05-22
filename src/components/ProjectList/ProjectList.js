import React, { Component, useState } from "react";
import { TweenLite, gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import Isotope from 'isotope-layout';
import image1 from "./image-1.jpg";
import image2 from "./image-2.jpg";
import image3 from "./image-3.jpg";
import image4 from "./image-4.jpg";

import "./ProjectList.scss";

gsap.registerPlugin(Draggable, InertiaPlugin);
const containerId = "imageContainer";
const containerSelector = "#" + containerId;
const rowClass = "row"
const rowSelector = "." + rowClass;
const imageClass = "sliderImage";
const imageSelector = "." + imageClass;
const imgURLArray = [{src: image1, class: "irlande"}, {src: image2, class: "irlande"}, {src: image3, class: "italie"}, {src: image4, class: "italie"}];
const imgURLArrayLength = imgURLArray ? imgURLArray.length : -1;
const rowNum = 4;
const imgNum = 6;

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
    
    // Add the images to our representation
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
    zIndex: 9999,
    // backgroundColor: "green",
    // opacity: "0.2",
  });
}

resize() {
  winMidX = window.innerWidth / 2;
  winMidY = window.innerHeight / 2;
  boxWidth = window.innerWidth * 0.35;
  boxHeight = window.innerHeight * 0.35;
  gutter = window.innerWidth * 0.09;
  horizSpacing = boxWidth + gutter * 1.5;
  vertSpacing = boxHeight + gutter;
  horizOffset = -(imgMidIndex * horizSpacing + boxWidth / 2) + winMidX;
  vertOffset = -(rowMidIndex * vertSpacing + boxHeight / 2) + winMidY;
  
  // Reset our container and rows
  gsap.set(containerSelector, {x: 0, y: 0});
  
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
      width: boxWidth * 0.5,
      height: boxHeight,
      x: function(index) {
        return index * horizSpacing;
      }
    });

    const tl = gsap.timeline();

    tl.from(row.querySelectorAll(imageSelector), {
      scale: 0.2,
      duration: 3,
      y: 500,
      ease: "sine.inOut",
      opacity: 0
    });
    
    // Update our representation of the rows
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
    border: "4px solid",
    top: 0,
    left: 0
  });

  let legend = document.querySelectorAll(imageSelector);
  for(let x = 0; x < legend.length; x++) {
    if (param) {
        const newImages = imgURLArray.filter(element => element.class === param);
        const newImagesArrayLength = newImages ? newImages.length : -1;
        legend[x].children[0].innerHTML = newImages[x % newImagesArrayLength].class;
    } else {
        legend[x].children[0].innerHTML = imgURLArray[x % imgURLArrayLength].class;
    }
  }

  gsap.set(rowSelector, {
    position: "absolute"
  });
}

createDraggable() {
  let options = {
    trigger: ".mask",
    dragResistance: 0.4,
    resistance: 400,
    onDrag: this.updateCenterElem,
  }
  
  if(useInertia) {
    options.inertia = true;
    options.onThrowUpdate = this.updateCenterElem;
    
    if(useCenterGrid) {
      options.onThrowComplete = this.centerGrid;
    }
  } else if(useCenterGrid) { // No inertia
    options.onDragEnd = this.centerGrid;
  }
      
  return Draggable.create(containerSelector, options);
}

  /*moveArrayIndex(array, oldIndex, newIndex) {
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
  }*/

  /*resize() {
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
  }*/

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
        <ul id="portfolio-flters">
          <li data-filter="*" onClick={() => {this.onFilterChange("*")}}>Le monde</li>
          <li data-filter="filter-one" onClick={() => {this.onFilterChange("italie")}}>Italie</li>
          <li data-filter="filter-two" onClick={() => {this.onFilterChange("irlande")}}>Irlande</li>
        </ul>
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
              <div id="imageContainer" className="filter-container"></div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default projectList;
