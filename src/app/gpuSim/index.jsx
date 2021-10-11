import { useState, useEffect, useRef } from 'react';
import { GPU } from 'gpu.js';

const Particle = {
  d: 0,
  u: 0,
  v: 0
}

const FluidSim = (props) => {
  const [n, setN] = useState(100)
  const [pixelSize, setPixelSize] = useState(10)
  const [fluidMtrix, setFluidMatrix] = useState(null)
  const [ctx, setCtx] = useState(null)

  const ref = useRef(null)
  const fluidMatrixRef = useRef(null)


  const generateMatrix = (size, defaultValue) => {
    const matrix = []
    const array = []
    let i;
    for(i = 0; i < size; ++i) {
      if(!defaultValue)
        array.push(0)
      else {
        if(typeof defaultValue === "object") {
          if(!Array.isArray(defaultValue))
            array.push({...defaultValue})
          else (Array.isArray(defaultValue))
            array.push([...defaultValue])
        }
        else
          array.push(defaultValue)
      }
    }
    for(i = 0; i < size; ++i) {
      matrix.push([...array])
    }
    return matrix;
  }

  useEffect(() => {
    setCtx(ref.current.getContext("2d"))
    setFluidMatrix(generateMatrix(Particle))
  }, [])



  return (
    <div>
      <canvas 
        width={(n + 2)*pixelSize}
        height={(n + 2)*pixelSize}
        ref={ref}
      />
    </div>
  )
}

export default FluidSim