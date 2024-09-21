import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>Time</h1>
      <p>{seconds} seconds</p>

      <div style={{display:'grid',
        gridTemplateColumns:'auto auto auto',
        margin:'auto',
        gap:"10px",
        width:"30%"}}>

        <button className='round-button'style={{backgroundColor: 'black',borderColor:'green'}}>Start</button>
        <button className='round-button'style={{backgroundColor: 'black',borderColor:'red'}}>Stop</button>
        <button className='round-button' style={{backgroundColor: 'black',borderColor:'white'}}>Lap</button>
      </div>
    </div>
  );
}

export default Timer;