import { useState, useEffect, useRef } from 'react';
import { GPU } from 'gpu.js';

const FluidSim = (props) => {
  const dt = 1;
  const diff = 0.001;
  const gpu = new GPU();
  const [n, setN] = useState(20)
  const [d, setD] = useState(null)
  const [u, setU] = useState(null)
  const [v, setV] = useState(null)
  const [pixelSize, setPixelSize] = useState(10)
  const [ctx, setCtx] = useState(null)

  const ref = useRef(null)
  const dRef = useRef(null)
  const uRef = useRef(null)
  const vRef = useRef(null)
  dRef.current = d;
  uRef.current = u;
  vRef.current = v;

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

  const renderCanvas = () => {
    let i, j;
    for(i = 1; i <= n; ++i) {
      for(j = 1; j <= n; ++j) {
        let a = d[i][j] * 255;
        ctx.fillStyle = `rgb(${a}, ${a}, ${a})`
        ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  const setBnd = (b, x) => {
    for(let i = 1; i <= n ; ++i) {
      x[0][i]   = b === 1? -x[1][i]: x[1][i]
      x[n+1][i] = b === 1? -x[n][i]: x[n][i]
      x[i][0]   = b === 2? -x[i][1]: x[i][1]
      x[i][n+1] = b === 2? -x[i][n]: x[i][n]      
    }
    x[0][0]     = 0.5 * (x[1][0]   + x[0][1])
    x[0][n+1]   = 0.5 * (x[0][n]   + x[1][n+1])
    x[n+1][0]   = 0.5 * (x[n][0]   + x[n+1][1])
    x[n+1][n+1] = 0.5 * (x[n][n+1] + x[n+1][n])
  }

  const diffuse = (b, orgMatrix) => {
    const calcDiffusion = gpu.createKernel(function(src, d, dt, n) {
      let dest = 0.5;
      const a = d * dt * n;
      for(let i = 0; i < 20; ++i) {
        dest = (src[this.thread.y][this.thread.x] + a * (
          src[this.thread.y-1][this.thread.x] + 
          src[this.thread.y+1][this.thread.x] + 
          src[this.thread.y][this.thread.x-1] + 
          src[this.thread.y][this.thread.x+1]))/(1 + 4*a)
      }
      return dest
    }, {output: [n + 2, n + 2]})
    const diffusedMatrix = calcDiffusion(orgMatrix, diff, dt, n)
    setBnd(b, diffusedMatrix)
    return diffusedMatrix
  }

  const denStep = () => {
    const dMatrix = dRef.current;
    const diffusedMatrix = diffuse(0, dMatrix)
    console.log(diffusedMatrix)
  }

  const velStep = () => {

  }

  const simLoop = () => {
    renderCanvas();
    denStep()
    // requestAnimationFrame(simLoop)
  }

  useEffect(() => {
    setCtx(ref.current.getContext("2d"))
    setD(generateMatrix(n + 2))
    setU(generateMatrix(n + 2))
    setV(generateMatrix(n + 2))
  }, [])

  useEffect(() => {
    if(ctx !== null) {
      simLoop()
    }
  }, [ctx])

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