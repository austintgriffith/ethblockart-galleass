import ReactDOM from 'react-dom';
import React, { useRef, useState } from 'react';
import Sketch from 'react-p5';
import keccak256 from 'keccak256';

const DEFAULT_SIZE = 1024;
const RANDOM = false; //set this to false to start using block data instead of random

const DOGGERWIDTH = 75;
const FISH_DENSITY = 42;
const MAXGAS = 15000000;

const FOREST = 1;
const GRASS = 2;
const DOCK = 3;
const MOREGRASS = 4;
const RIVER = 5;
const EVENMOREGRASS = 6;
const SETTLERSDOCK = 7;
const COPPERMTN = 8;
const CORN = 9;
const DEADGRASS = 10;
const SETTLERS = 11;
const DEADMTN = 12;
const MOREDEADGRASS = 13;
const DEADTIMBER = 14;
const MOREMOREDEADGRASS = 15;
const MOREDEADMTN = 16;
const FISHMONGER = 17;
const COURTHOUSE = 18;
const MOREMOREMOREDEADGRASS = 19;
const HARBOR = 20;
const MARKET = 21;
const TIMBERMILL = 22;
const MININGCAMP = 23;
const MININGSHAFT = 24;
const MTN = 25;
const SILVERMTNCAMP = 26;
const SILVERMTN = 27;
const TIMBERCAMP = 28;
const VILLAGERS = 29;
const VILLAGERSDOCK = 30;
const WARRIORS = 31;
const WARRIORSDOCK = 32;

const CustomStyle = ({
  fakeRandomHash,
  block,
  handleResize,
  width,
  height,
  canvasRef,
}) => {
  const horizon = height / 2;
  const SIZE = width;
  let M = SIZE / DEFAULT_SIZE;

  const SHIPDEPTH = SIZE / 4;

  //const hash = fakeRandomHash
  const { hash } = block;

  let cloudSizes = [
    [400, 152],
    [600, 228],
    [901, 250],
    [810, 280],
    [810, 280],
    [810, 280],
    [810, 280],
  ];

  let possibleLetters = 'ABCDEF1234567890xaabcdef'; //<-- notice two a's in a row to load both

  let sky = useRef();
  let sea = useRef();
  let clouds = useRef([]);
  let oceanCover = useRef([]);
  let doggers = useRef([]);
  let fish = useRef([]);
  let tiles = useRef([]);

  let topLeftCorner = useRef();
  let topRightCorner = useRef();
  let rightEdge = useRef();
  let leftEdge = useRef();
  let handwriting = useRef({});

  let lastChar;
  const translateChracterToPath = (character) => {
    let image = '/galleass/handwritten/';

    if (character == '#') {
      image = character + '.png';
    } else if (character == ' ') {
      image = image + 'space.png';
    } else if (character == '.') {
      image = image + 'dot.png';
    } else if (character == ',') {
      image = image + 'comma.png';
    } else if (character == ':') {
      image = image + 'colon.png';
    } else if (character == '-') {
      image = image + 'dash.png';
    } else if (character == character.toUpperCase()) {
      image = image + character + '.png';
    } else {
      if (
        (character == 'a' || character == 'l' || character == 's') &&
        lastChar == character
      ) {
        image = image + character + '_2.png';
      } else {
        image = image + character + '_.png';
      }
    }
    lastChar = character;

    return image;
  };

  function preload(p5) {
    sky.current = p5.loadImage('/galleass/sky.jpg');
    sea.current = p5.loadImage('/galleass/oceanblackblur.jpg');
    topLeftCorner.current = p5.loadImage('/galleass/topleftcorner.png');
    topRightCorner.current = p5.loadImage('/galleass/toprightcorner.png');
    rightEdge.current = p5.loadImage('/galleass/rightedge.png');
    leftEdge.current = p5.loadImage('/galleass/leftedge.png');
    for (let c = 0; c < 7; c++) {
      clouds.current[c] = p5.loadImage(
        '/galleass/cloud' + (c + 1) + '_smaller.png'
      );
    }
    for (let c = 0; c < 4; c++) {
      oceanCover.current[c] = p5.loadImage(
        '/galleass/oceancover' + (c + 1) + '.png'
      );
    }

    for (let c = 0; c < 6; c++) {
      doggers.current[c] = p5.loadImage('/galleass/dogger' + (c + 1) + '.png');
    }
    for (let c = 0; c < 10; c++) {
      fish.current[c] = p5.loadImage('/galleass/fish' + (c + 1) + '.png');
    }
    for (let c = 0; c < 32; c++) {
      tiles.current[c] = p5.loadImage('/galleass/tile' + (c + 1) + '.png');
    }

    for (let l in possibleLetters) {
      let path = translateChracterToPath(possibleLetters[l]);
      //console.log("LOADING",path)
      handwriting.current[path] = p5.loadImage(path);
    }
  }

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(SIZE, SIZE).parent(canvasParentRef);
    canvasRef.current = p5;
    preload(p5);
  };

  const draw = (p5) => {
    let currentHash = hash;
    let currentEntropyPointer = 2;
    // preload(p5);

    const takeTwoBytesOfEntropy = () => {
      let twoBytes =
        currentHash[currentEntropyPointer++] +
        currentHash[currentEntropyPointer++] +
        currentHash[currentEntropyPointer++] +
        currentHash[currentEntropyPointer++];
      twoBytes = parseInt(twoBytes, 16);
      if (currentEntropyPointer >= 60) {
        currentHash = keccak256(currentHash).toString('hex');
        currentEntropyPointer = 2;
      }
      if (!RANDOM) return twoBytes;
      return Math.random() * 65535;
    };

    p5.background(0);

    let possibleOffset = 4000 - SIZE;
    ///console.log("possibleOffset",possibleOffset)

    p5.image(
      sky.current,
      0 - (possibleOffset * takeTwoBytesOfEntropy()) / 65535,
      0,
      4000,
      SIZE / 2
    );

    p5.image(
      sea.current,
      0 - (possibleOffset * takeTwoBytesOfEntropy()) / 65535,
      SIZE / 2,
      4000,
      SIZE / 2
    );

    for (let c = 1; c < 8; c++) {
      let blocksTraveled = 0;

      let speed = 32;
      let startingLocation = takeTwoBytesOfEntropy();

      let location = startingLocation + blocksTraveled * speed;
      let cloudSize = cloudSizes[c - 1];
      let cloudwidth = cloudSize[0] * M;
      let cloudheight = cloudSize[1] * M;
      location = width * (location / 65535);
      while (location > width) {
        location -= width + cloudwidth;
      }
      while (location < cloudwidth * -1) {
        location += width + cloudwidth;
      }
      let top = horizon - cloudheight + 2;
      if (c >= 6) top = 0;
      else {
        //top+= (height-horizon)*take2BytesOfEntropy()/65535;
      }
      p5.image(clouds.current[c - 1], location, top, cloudwidth, cloudheight);
    }

    let landHorizon = horizon - 45 * M;

    let underwater = true;

    let tileList = [];

    let tileWidth = 64 * M;
    let tileHeight = 100 * M;

    for (let t = 0; t < 16; t++) {
      const tileRandomish = takeTwoBytesOfEntropy();
      if (underwater) {
        if (tileRandomish > 40000 && t < 10) {
          p5.image(
            leftEdge.current,
            t * tileWidth,
            landHorizon,
            tileWidth,
            tileHeight
          );
          underwater = false;
        }
      } else {
        const commonTiles = [
          FOREST,
          GRASS,
          RIVER,
          GRASS,
          FOREST,
          MTN /*3, 4, , 6, 9, 19, 18, 25 */,
        ];
        const keyResourceTiles = [FOREST, CORN, MTN, TIMBERCAMP];
        const exoticResourceTiles = [
          COPPERMTN,
          TIMBERMILL,
          TIMBERCAMP,
          MININGCAMP,
          SILVERMTN,
        ];
        const settlersTiles = [SETTLERS, SETTLERSDOCK];
        const villageTiles = [VILLAGERS, VILLAGERSDOCK];
        const castleTiles = [WARRIORS, WARRIORSDOCK];
        if (
          tileRandomish > 55000 ||
          (t > 13 && tileRandomish > 40000) ||
          (t > 14 && tileRandomish > 20000) ||
          t >= 14
        ) {
          underwater = true;
          tileList[t] = 0;
          //console.log("=)rightedge")
          p5.image(
            rightEdge.current,
            t * tileWidth,
            landHorizon,
            tileWidth,
            tileHeight
          );
        } else if (tileRandomish > 20000) {
          tileList[t] = commonTiles[tileRandomish % commonTiles.length];
          //console.log("=)-"+tileList[t])
          p5.image(
            tiles.current[tileList[t] - 1],
            t * tileWidth,
            landHorizon,
            tileWidth,
            tileHeight
          );
        } else if (tileRandomish > 15000) {
          tileList[t] =
            exoticResourceTiles[tileRandomish % exoticResourceTiles.length];
          //console.log("=)-"+tileList[t])
          p5.image(
            tiles.current[tileList[t] - 1],
            t * tileWidth,
            landHorizon,
            tileWidth,
            tileHeight
          );
        } else if (tileRandomish > 10000) {
          tileList[t] = settlersTiles[tileRandomish % settlersTiles.length];
          //console.log("=)-"+tileList[t])
          p5.image(
            tiles.current[tileList[t] - 1],
            t * tileWidth,
            landHorizon,
            tileWidth,
            tileHeight
          );
        } else if (tileRandomish > 8000) {
          tileList[t] = villageTiles[tileRandomish % villageTiles.length];
          //console.log("=)-"+tileList[t])
          p5.image(
            tiles.current[tileList[t] - 1],
            t * tileWidth,
            landHorizon,
            tileWidth,
            tileHeight
          );
        } else if (tileRandomish > 7000) {
          tileList[t] = castleTiles[tileRandomish % castleTiles.length];
          //console.log("=)-"+tileList[t])
          p5.image(
            tiles.current[tileList[t] - 1],
            t * tileWidth,
            landHorizon,
            tileWidth,
            tileHeight
          );
        } else {
          tileList[t] = tileRandomish % tiles.current.length;
          //console.log("=)-"+tileList[t])
          if (tiles.current[tileList[t]]) {
            p5.image(
              tiles.current[tileList[t]],
              t * tileWidth,
              landHorizon,
              tileWidth,
              tileHeight
            );
          }
        }
      }
    }

    let gasUsed = block.gasUsed.hex;
    //console.log(gasUsed, 'ok');
    let currentGasEntropyPointer = 2;
    let currentGasEntropy = keccak256(parseInt(gasUsed)).toString('hex');
    //console.log("startingGasEntropy",currentGasEntropy)
    const getGasEntropy = () => {
      if (currentGasEntropyPointer >= 59) {
        //lol
        currentGasEntropyPointer = 0;
        currentGasEntropy = keccak256(currentGasEntropy).toString('hex');
      }
      let twoBytes =
        currentGasEntropy[currentGasEntropyPointer++] +
        currentGasEntropy[currentGasEntropyPointer++] +
        currentGasEntropy[currentGasEntropyPointer++] +
        currentGasEntropy[currentGasEntropyPointer++];
      twoBytes = parseInt(twoBytes, 16);
      if (!RANDOM) return twoBytes;
      return Math.random() * 65535;
    };

    let orderedFish = [];

    for (let f = 0; f < (FISH_DENSITY * parseInt(gasUsed, 16)) / MAXGAS; f++) {
      let fishType;
      const randish = getGasEntropy();
      if (randish > 30000) {
        fishType = 3;
      } else if (randish > 15000) {
        fishType = 2;
      } else if (randish > 10000) {
        fishType = 1;
      } else if (randish > 1000) {
        fishType = 0;
      } else {
        fishType = 4;
      }

      if (getGasEntropy() % 2 == 1) {
        fishType += 5;
      }

      orderedFish.push([
        fish.current[fishType],
        (width * getGasEntropy()) / 65535,
        height - ((SIZE / 4) * getGasEntropy()) / 65535,
        64 * M,
        32 * M,
      ]);
    }

    orderedFish.sort((a, b) => {
      return a[2] - b[2];
    });

    for (let f in orderedFish) {
      p5.image(...orderedFish[f]);
    }

    for (let c = 1; c < 5; c++) {
      let blocksTraveled = 0;

      let speed = 32;
      let startingLocation = takeTwoBytesOfEntropy();

      let location = startingLocation + blocksTraveled * speed;
      let cloudSize = cloudSizes[c - 1];
      let cloudwidth = cloudSize[0] * M;
      let cloudheight = cloudSize[1] * M;
      location = SIZE * (location / 65535);
      while (location > width) {
        location -= width + cloudwidth;
      }
      while (location < cloudwidth * -1) {
        location += width + cloudwidth;
      }
      let top = horizon - cloudheight + 2;
      if (c >= 6) top = 0;
      else {
        //top+= (height-horizon)*take2BytesOfEntropy()/65535;
      }
      p5.image(
        oceanCover.current[c - 1],
        location,
        height - cloudheight,
        cloudwidth,
        cloudheight
      );
    }

    let orderedShips = [];
    for (let t in block.transactions) {
      const transaction = block.transactions[t];
      let currentTransactionEntropyPointer = 2;
      const takeOneByteOfTransactionEntropy = () => {
        let byte =
          transaction[currentTransactionEntropyPointer++] +
          transaction[currentTransactionEntropyPointer++];
        byte = parseInt(byte, 16);
        if (!RANDOM) return byte;
        return Math.random() * 256;
      };
      orderedShips.push([
        doggers.current[
          takeOneByteOfTransactionEntropy() % doggers.current.length
        ],
        (width * takeOneByteOfTransactionEntropy()) / 255 - DOGGERWIDTH / 2,
        horizon + 32 + (SHIPDEPTH * takeOneByteOfTransactionEntropy()) / 256,
        DOGGERWIDTH * 0.777 * M,
        DOGGERWIDTH * 0.777 * 0.9 * M,
      ]);
    }

    orderedShips.sort((a, b) => {
      return a[2] - b[2];
    });

    for (let s in orderedShips) {
      p5.image(...orderedShips[s]);
    }

    let TEXTSIZE = 22 * M;
    let LETTER_SPACING = 22 * M;
    let someString = block.hash;
    let textStart =
      width / 2 - (someString.length * TEXTSIZE) / 4 - TEXTSIZE / 4;
    for (let l in someString) {
      //console.log("WRITINGE:",someString[l])
      p5.image(
        handwriting.current[translateChracterToPath(someString[l])],
        textStart + (TEXTSIZE / 2) * l,
        horizon / 4,
        TEXTSIZE,
        TEXTSIZE
      );
    }

    TEXTSIZE = 64 * M;
    LETTER_SPACING = 64 * M;
    someString = '' + block.number
    textStart = width / 2 - (someString.length * TEXTSIZE) / 4 - TEXTSIZE / 4;
    for (let l in someString) {
      //console.log("WRITINGE:",someString[l])
      p5.image(
        handwriting.current[translateChracterToPath(someString[l])],
        textStart + (TEXTSIZE / 2) * l,
        horizon / 12,
        TEXTSIZE,
        TEXTSIZE
      );
    }

    TEXTSIZE = 22 * M;
    LETTER_SPACING = 22 * M;
    someString = '' + block.timestamp
    textStart = width / 2 - (someString.length * TEXTSIZE) / 4 - TEXTSIZE / 4;
    for (let l in someString) {
      //console.log("WRITINGE:",someString[l])
      p5.image(
        handwriting.current[translateChracterToPath(someString[l])],
        textStart + (TEXTSIZE / 2) * l,
        horizon / 3,
        TEXTSIZE,
        TEXTSIZE
      );
    }

    //console.log(tileList)
    /*
    //given the list of rendered tiles we can do all sorts of stuff...
    // was thinking it could have a population and the population
    // would work on nearby tiles so each block has a different
    // bonus of resources



    const populationBonus = (tile)=>{
      if(tile==SETTLERS) return 1;
      if(tile==SETTLERSDOCK) return 2;
      if(tile==VILLAGERS) return 3;
      if(tile==VILLAGERSDOCK) return 4;
      if(tile==WARRIORS) return 5;
      if(tile==WARRIORSDOCK) return 6;
      return 0;
    }


    for(let t in tileList){
      let populationsAtWork = populationBonus(tileList[t])
      //if(populationsAtWork>0) console.log("There is a population of "+populationsAtWork+" at tile "+t+"...")
    }
    */

    p5.image(topRightCorner.current, width - 400 * M, 0, 400 * M, 396 * M);
    p5.image(topLeftCorner.current, 0, 0, 400 * M, 396 * M);
  };

  return (
    <Sketch
      setup={setup}
      draw={draw}
      // preload={preload}
      windowResized={handleResize}
    />
  );
};
export default CustomStyle;
