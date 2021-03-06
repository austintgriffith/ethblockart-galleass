import ReactDOM from 'react-dom';
import React, { useRef, useState } from 'react';
import Sketch from 'react-p5';
import keccak256 from 'keccak256';

/*
title: Galleass
description: Blockchain art in the Age of Sail. Fish represent gas usage, ships represent transactions, the island is procedurally generated from the block hash and produces a deterministic inventory of NFT attributes.
thumbnail image: https://austingriffith.com/images/galleassart.jpg
creator name: Austin Griffith
*/



const DEFAULT_SIZE = 1024;
const RANDOM = false; //set this to false to start using block data instead of random

const DOGGERWIDTH = 75;
const SCHOONERWIDTH = 140;

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
const COPPERMTNCAMP = 19;
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
  time,
  fakeRandomHash,
  block,
  handleResize,
  width,
  height,
  canvasRef,
  attributesRef,
}) => {
  const horizon = height / 2;
  const SIZE = width;
  let M = SIZE / DEFAULT_SIZE;

  const SHIPDEPTH = SIZE / 5;

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
  let schooners = useRef([]);
  let fish = useRef([]);
  let tiles = useRef([]);
  let inventoryImages = useRef({});

  let topLeftCorner = useRef();
  let topRightCorner = useRef();
  let rightEdge = useRef();
  let leftEdge = useRef();
  let handwriting = useRef({});

  let attributes = useRef({});

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

    inventoryImages.current['greens'] = p5.loadImage('/galleass/greens.png');
    inventoryImages.current['fillet'] = p5.loadImage('/galleass/fillet.png');
    inventoryImages.current['timber'] = p5.loadImage('/galleass/timber.png');
    inventoryImages.current['stone'] = p5.loadImage('/galleass/stone.png');
    inventoryImages.current['copper'] = p5.loadImage('/galleass/copper.png');
    inventoryImages.current['silver'] = p5.loadImage('/galleass/silver.png');

    //console.log("timber.current",timber.current)

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

    for (let c = 0; c < 4; c++) {
      schooners.current[c] = p5.loadImage('/galleass/schooner' + (c + 1) + '.png');
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
    preload(p5);

    canvasRef.current = p5;
    attributesRef.current = () => {
      return {
        attributes: attributes,
      };
    };
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

      let speed = (128 * takeTwoBytesOfEntropy()/65535) * M - (128 * takeTwoBytesOfEntropy()/65535) * M;
      let startingLocation = takeTwoBytesOfEntropy();

      let location = startingLocation + (time * speed);
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
          let randomTile = tileList[t] - 1;
          if (randomTile < 0) randomTile = 0;
          if (tiles.current[randomTile]) {
            p5.image(
              tiles.current[randomTile],
              t * tileWidth,
              landHorizon,
              tileWidth,
              tileHeight
            );
          }
        }
      }
    }



    let gasUsed = block.gasUsed._hex || block.gasUsed.hex;
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

      let speed = (32 * takeTwoBytesOfEntropy()/65535) * M - (32 * takeTwoBytesOfEntropy()/65535) * M;
      let startingLocation = takeTwoBytesOfEntropy();

      let location = startingLocation + (time * speed);

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
          transaction.hash[currentTransactionEntropyPointer++] +
          transaction.hash[currentTransactionEntropyPointer++];
        byte = parseInt(byte, 16);
        if (!RANDOM) return byte;
        return Math.random() * 256;
      };

      let value = transaction.value.hex || transaction.value._hex
      let calldata = transaction.data

      let thisShipWidth
      let shipMode
      let thisShipImage
      let traveled = 0

      //console.log("TX",calldata,value)

      if(calldata && calldata.length>2){
        //console.log("big ship")
        thisShipWidth = SCHOONERWIDTH
        shipMode = takeOneByteOfTransactionEntropy() % schooners.current.length

        let speed = 3 + takeOneByteOfTransactionEntropy()%3 - takeOneByteOfTransactionEntropy()%3

        if(shipMode==2){
          traveled = (-1 * speed * M) * time
        }else if(shipMode==3){
          traveled = (speed * M) * time
        }

        thisShipImage = schooners.current[
          shipMode
        ]
      }else{
        //console.log("little ship")
        thisShipWidth = DOGGERWIDTH
        shipMode = takeOneByteOfTransactionEntropy() % doggers.current.length

        let speed = 4 + takeOneByteOfTransactionEntropy()%4 - takeOneByteOfTransactionEntropy()%4

        if(shipMode==5){
          traveled = (-1 * speed * M) * time
        }else if(shipMode==4){
          traveled = (speed * M) * time
        }

        thisShipImage = doggers.current[
          shipMode
        ]
      }

      let currentLocation = ((((width * takeOneByteOfTransactionEntropy()) / 255) + traveled))
      if(currentLocation>width){
        currentLocation-=width
      }else if(currentLocation<0){
        currentLocation+=width
      }

      orderedShips.push([
        thisShipImage,
        currentLocation - thisShipWidth / 2,
        horizon + 32 + (SHIPDEPTH * takeOneByteOfTransactionEntropy()) / 256,
        thisShipWidth * 0.777 * M,
        thisShipWidth * 0.777 * 0.85 * M,
      ]);
    }

    orderedShips.sort((a, b) => {
      return (a[2]+a[4]) - (b[2]+b[4]);
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
    someString = '' + block.number;
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
    someString = '' + block.timestamp;
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

    let inventory = {};
    let inventoryCount = 0;

    const addInventory = (name, amount) => {
      if (!inventory[name]) {
        inventory[name] = {
          amount: 0,
          image: inventoryImages.current[name],
        };
        inventoryCount++;
      }
      inventory[name].amount += amount;
    };

    for (let t in tileList) {
      if (tileList[t] == FOREST) {
        addInventory('timber', 1);
      } else if (tileList[t] == TIMBERCAMP) {
        addInventory('timber', 3);
      } else if (tileList[t] == TIMBERMILL) {
        addInventory('timber', 5);
      }
    }

    for (let t in tileList) {
      if (tileList[t] == MTN) {
        addInventory('stone', 1);
      } else if (tileList[t] == MININGCAMP) {
        addInventory('stone', 3);
      } else if (tileList[t] == MININGSHAFT) {
        addInventory('stone', 5);
      }
    }

    for (let t in tileList) {
      if (
        tileList[t] == GRASS ||
        tileList[t] == EVENMOREGRASS ||
        tileList[t] == MOREGRASS ||
        tileList[t] == DOCK
      ) {
        addInventory('greens', 1);
      }
    }

    for (let t in tileList) {
      if (tileList[t] == COPPERMTN) {
        addInventory('copper', 3);
      } else if (tileList[t] == COPPERMTNCAMP) {
        addInventory('copper', 5);
      }
    }

    for (let t in tileList) {
      if (tileList[t] == SILVERMTN) {
        addInventory('silver', 3);
      } else if (tileList[t] == SILVERMTN) {
        addInventory('SILVERMTNCAMP', 5);
      }
    }

    for (let t in tileList) {
      if (tileList[t] == SETTLERS) {
        addInventory('fillet', 1);
      } else if (tileList[t] == VILLAGERS) {
        addInventory('fillet', 3);
      } else if (tileList[t] == SETTLERSDOCK) {
        addInventory('fillet', 2);
      } else if (tileList[t] == VILLAGERSDOCK) {
        addInventory('fillet', 5);
      }
    }

    for (let t in tileList) {
      if (tileList[t] == RIVER) {
        for (let i in inventory) {
          console.log('inventory', i, inventory);
          inventory[i].amount = Math.floor(inventory[i].amount * 1.5);
        }
      }
    }

    const ICON_WIDTH = 60 * M;
    const ICON_HEIGHT = 40 * M;

    TEXTSIZE = 64 * M;
    LETTER_SPACING = 64 * M;

    const TOTAL_INV_SPACING = 130 * M;

    const drawInv = (amount, offset, image) => {
      someString = '' + amount;
      textStart =
        width / 2 - (someString.length * TEXTSIZE) / 4 - TEXTSIZE / 4 + offset;
      for (let l in someString) {
        //console.log("WRITINGE:",someString[l])
        p5.image(
          handwriting.current[translateChracterToPath(someString[l])],
          textStart + (TEXTSIZE / 2) * l,
          horizon - horizon / 3,
          TEXTSIZE,
          TEXTSIZE
        );
      }
      p5.image(
        image,
        width / 2 - ICON_WIDTH / 2 + offset,
        horizon - horizon / 3 - ICON_HEIGHT,
        ICON_WIDTH,
        ICON_HEIGHT
      );
    };

    //console.log("inventoryCount",inventoryCount)
    let extraOffset = 0
    let attributeUpdate = []
    if(inventoryCount%2==1) extraOffset = TOTAL_INV_SPACING/2
    let count = 0
    for(let i in inventory){
      //console.log("Drawing ",i,inventory[i])
      let offset = ((TOTAL_INV_SPACING) * ++count) - (inventoryCount * TOTAL_INV_SPACING/2) - TOTAL_INV_SPACING/2
      drawInv(inventory[i].amount,offset,inventory[i].image)
      attributeUpdate.push(
        {
          display_type: 'number',
          trait_type: i,
          value: inventory[i].amount
        }
      )
    }

    console.log("ATTRIBUTES",attributeUpdate)
    attributes = attributeUpdate








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
