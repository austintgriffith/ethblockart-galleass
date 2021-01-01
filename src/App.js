import ReactDOM from 'react-dom';
import React, { useRef, useState } from 'react';
import Sketch from 'react-p5';
import useDimensions from 'react-cool-dimensions';
import keccak256 from 'keccak256';

import blocks from './blocks';
import CustomStyle from './CustomStyle';

function App() {
  const [fakeRandomHash, setFakeRandomHash] = useState(
    keccak256(Date.now()).toString('hex').substr(2)
  );

  /*
  Wrapped Component required to make p5 demos compatible with EthBlock.art
  As a creative coder you can ignore this file, check CustomStyle.js
*/
  const canvasRef = useRef();
  const { ref, width, height } = useDimensions({});
  const _onCanvasResize = (p5) => {
    p5.resizeCanvas(width, height);
  };

  return (
    <div
      ref={ref}
      style={{
        margin: '0 auto',
        marginTop: '64px',
        width: '60vw',
        height: '60vw',
      }}
    >
      <p>EthBlock.art P5.js boilerplate</p>
      {width && height ? (
        <CustomStyle
          width={width}
          block={blocks[0]}
          height={height}
          canvasRef={canvasRef}
          handleResize={_onCanvasResize}
        />
      ) : null}
    </div>
  );
}

export default App;
