import ReactDOM from 'react-dom'
import React, { useRef, useState } from 'react'
import Sketch from "react-p5";
import blocks from './blocks'

const SIZE = 1280
const RANDOM = false //set this to false to start using block data instead of random

const CustomStyle = ({ block = blocks[0], width = SIZE,height = SIZE,horizon = SIZE/2}) => {
  const { hash } = block

  let cloudSizes = [
    [400,152],
    [600,228],
    [901,250],
    [810,280],
    [810,280],
    [810,280],
    [810,280],
  ];

  let sky;
  let sea;

  let clouds=[];
  let cloudLocations=[]

  let currentHash = hash
  let currentEntropyPointer = 2
  const takeTwoBytesOfEntropy = ()=>{
    let twoBytes = hash[currentEntropyPointer++]+hash[currentEntropyPointer++]+hash[currentEntropyPointer++]+hash[currentEntropyPointer++]
    twoBytes = parseInt(twoBytes,16)
    if(!RANDOM) return twoBytes
    return Math.random()*65535
  }


  function preload(p5)  {
    sky = p5.loadImage('sky.jpg');
    sea = p5.loadImage('oceanblackblur.jpg');
    for(let c=0;c<7;c++){
      clouds[c] = p5.loadImage('cloud'+(c+1)+'_smaller.png');
    }
  }

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(SIZE, SIZE).parent(canvasParentRef);

    for(let c=0;c<7;c++){
      cloudLocations[c] = takeTwoBytesOfEntropy();
    }
  };

  const draw = (p5) => {
    p5.background(0);
    p5.image(sky, 0, 0, 4000, SIZE/2);
    p5.image(sea, 0, SIZE/2, 4000, SIZE/2);


    for(let c=1;c<8;c++){
      let blocksTraveled = 1;

      let speed = 32
      let startingLocation = cloudLocations[c]

      let location = startingLocation + blocksTraveled*speed;
      let cloudSize = cloudSizes[c-1];
      let cloudwidth = cloudSize[0];
      let cloudheight = cloudSize[1];
      location = width * (location/65535);
      while(location>width)
      {
        location-=(width+cloudwidth);
      }
      while(location<(cloudwidth*-1))
      {
        location+=(width+cloudwidth);
      }
      let top = (horizon-cloudheight+2);
      if(c>=6) top=0;
      else{
        //top+= (height-horizon)*take2BytesOfEntropy()/65535;
      }
      p5.image(clouds[c-1], location, top, cloudwidth, cloudheight);
    }

  };

  return <Sketch setup={setup} draw={draw} preload={preload}/>;
}

function App() {
  return (
    <div className="App">
      <CustomStyle />
    </div>
  );
}

export default App;
