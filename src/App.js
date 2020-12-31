import ReactDOM from 'react-dom'
import React, { useRef, useState } from 'react'
import Sketch from "react-p5";
import blocks from './blocks'

const SIZE = 1280
const RANDOM = true //set this to false to start using block data instead of random

const CustomStyle = ({ block = blocks[0], width = SIZE,height = SIZE,horizon = SIZE/2}) => {
  const { hash } = block

  let currentHash = hash
  let currentEntropyPointer = 2
  const take2BytesOfEntropy = ()=>{
    if(!RANDOM) return parseInt(hash[currentEntropyPointer++]+hash[currentEntropyPointer++]+hash[currentEntropyPointer++]+hash[currentEntropyPointer++],16)
    return Math.random()*65535
  }

  let renderedClouds = []

  let cloudSizes = [
    [400,152],
    [600,228],
    [901,250],
    [810,280],
    [810,280],
    [810,280],
    [810,280],
  ];

  let imageNumber = 1

  for(let c=1;c<8;c++){
    let blocksTraveled = 1;
    let image = "cloud"+c+"_smaller.png";
    let speed = 32
    let startingLocation = take2BytesOfEntropy()

    let location = startingLocation + blocksTraveled*speed;
    let cloudSize = cloudSizes[c-1];
    let cloudwidth = cloudSize[0];
    location = width * (location/65535);
    while(location>width)
    {
      location-=(width+cloudwidth);
    }
    while(location<(cloudwidth*-1))
    {
      location+=(width+cloudwidth);
    }
    let top = (horizon-cloudSize[1]+2);
    if(c>=6) top=0;
    else{
      //top+= (height-horizon)*take2BytesOfEntropy()/65535;
    }
    renderedClouds.push(
      <div
        key={"cloud"+c}
        style={{
          zIndex:1,
          position:'absolute',
          left:location,
          top:top,
          opacity:.9,
          backgroundImage:"url('"+image+"')",
          height:cloudSize[1],
          width:cloudwidth
        }}
      />
    )
  }





  return (
    <div style={{position:"absolute",left:0,top:0,width:width,height:height,overflow:'hidden'}}>
        <div style={{position:'absolute',left:0,top:0,opacity:1,backgroundSize:"cover",backgroundImage:"url('sky.jpg')",backgroundRepeat:'no-repeat',height:horizon,width:width}}></div>
        { renderedClouds }
        <div style={{position:'absolute',left:0,top:horizon,opacity:1,backgroundImage:"url('oceanblackblur.jpg')",backgroundRepeat:'no-repeat',height:height+horizon,width:width}}></div>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <CustomStyle />
    </div>
  );
}

export default App;
