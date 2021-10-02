import { useEffect, useRef, useState } from 'react';
import "./home.scss";

const Application = () => {
  const N = 85
  const sourceDensity = 10
  const diff = 0.001
  const visc = 0.5
  const pixelSize = 10
  const dt = 1
  const ref = useRef(null)
  const [ctx, setCtx] = useState(null)
  const [fluidMatrix, setFluidMatrix] = useState()
  const fluidMatrixRef = useRef()
  fluidMatrixRef.current = fluidMatrix;
  const [sources, setSources] = useState([])
  const sourcesRef = useRef();
  sourcesRef.current = sources;

  useEffect(() => {
    const c = ref.current.getContext("2d")
    setCtx(c);
    const sideLength = N + 2

    const tempMatrix = []
    for(let i = 0; i < sideLength * sideLength; ++i)
      tempMatrix.push({d: 0, u: 0, v: 0})
    setFluidMatrix(tempMatrix)
  }, [])

  const IX = (i, j) => (i + (N + 2) * j);

  const renderCanvas = () => {
    let i, j;
    for(i = 1; i <= N; ++i) {
      for(j = 1; j <= N; ++j) {
        let a = fluidMatrix[IX(i, j)].d * 255;
        let c = (Math.abs(fluidMatrix[IX(i, j)].v) + Math.abs(fluidMatrix[IX(i, j)].u)) * 6 * 255;
        ctx.fillStyle = `rgb(${a}, ${0}, ${c})`
        ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  const setBnd = (b, x, ignoreProp = false) => {
    let property;
    switch(b) {
      case 0: property = "d"; break;
      case 1: property = "u"; break;
      case 2: property = "v"; break;
      default: break;
    }
    for(let i = 1; i <= N && !ignoreProp; ++i) {
      x[IX(0,i)][property]   = b === 1? -x[IX(1,i)][property]: x[IX(1,i)][property]
      x[IX(N+1,i)][property] = b === 1? -x[IX(N,i)][property]: x[IX(N,i)][property]
      x[IX(i,0)][property]   = b === 2? -x[IX(i,1)][property]: x[IX(i,1)][property]
      x[IX(i,N+1)][property] = b === 2? -x[IX(i,N)][property]: x[IX(i,N)][property]      
    }
    x[IX(0,0)][property]     = 0.5 * (x[IX(1,0)][property] + x[IX(0,1)][property])
    x[IX(0,N+1)][property]   = 0.5 * (x[IX(0,N)][property] + x[IX(1,N+1)][property])
    x[IX(N+1,0)][property]   = 0.5 * (x[IX(N,0)][property] + x[IX(N+1,1)][property])
    x[IX(N+1,N+1)][property] = 0.5 * (x[IX(N,N+1)][property] + x[IX(N+1,N)][property])
  }

  const calcDiffusion = (b, dest, src, d) => {
    let property;
    switch(b) {
      case 0: property = "d"; break;
      case 1: property = "u"; break;
      case 2: property = "v"; break;
      default: break;
    }
    if(src) {
      const a = d * dt * N;
      let i, j, k;
      for(k = 0; k <= 20; ++k) {
        for(i = 1; i <= N; ++i) {
          for(j = 1; j <= N; ++j) {
            dest[IX(i, j)][property] = (src[IX(i, j)][property] + a * (
              src[IX(i-1, j)][property] + 
              src[IX(i+1, j)][property] + 
              src[IX(i, j-1)][property] + 
              src[IX(i, j+1)][property]))/(1 + 4*a)
          }
        }
      }
      setBnd(b, dest)
    }
  }

  const addSources = (dest, sources) => {
    sources.forEach((s, index) => {
      dest[IX(s.x, s.y)].d += dt * s.d
      dest[IX(s.x, s.y)].u += dt * s.u
      dest[IX(s.x, s.y)].v += dt * s.v
    })
    setSources([])
  }

  const calcAdvection = (b, dest, src) => {
    let i, j, i0, j0, i1, j1;
    let x, y, s0, s1, t0, t1;
    const dt0 = dt * N;
    let property;
    switch(b) {
      case 0: property = "d"; break;
      case 1: property = "u"; break;
      case 2: property = "v"; break;
      default: break;
    }
    for(i = 1; i <= N; ++i) {
      for(j = 1; j <= N; ++j) {
        x = i - dt0 * src[IX(i,j)].u
        y = j - dt0 * src[IX(i,j)].v
        if(x < 0.5) x = 0.5; if(x > N + 0.5) x = N + 0.5; i0 = Math.floor(x); i1 = i0 + 1;
        if(y < 0.5) y = 0.5; if(y > N + 0.5) y = N + 0.5; j0 = Math.floor(y); j1 = j0 + 1;
        s1 = x - i0; s0 = 1 - s1;
        t1 = y - j0; t0 = 1 - t1;
        dest[IX(i,j)][property] = s0*(t0*src[IX(i0,j0)][property] + t1*src[IX(i0,j1)][property]) + s1*(t0*src[IX(i1,j0)][property] + t1*src[IX(i1,j1)][property])
      }
    }
    setBnd(b, dest)
  }

  const handleAddSources = (e) => {
    const {offsetTop, offsetLeft} = e.target;
    const {clientX, clientY} = e;
    const y = Math.floor((clientY - offsetTop - 2) / pixelSize)
    const x = Math.floor((clientX - offsetLeft - 2 )/pixelSize)
    if(x && y) {
      const tempSource = {x, y, d: sourceDensity, u: e.movementX/3, v: e.movementY/3}
      const temp = [...sources];
      temp.push(tempSource)
      setSources(temp)
    }
  }

  const denStep = (destMatrix, orgMatrix, sources) => {
    addSources(orgMatrix, sources)
    calcDiffusion(0, destMatrix, orgMatrix, diff)
    orgMatrix = destMatrix;
    calcAdvection(0, destMatrix, orgMatrix)
  }

  const velStep = (destMatrix, orgMatrix) => {
    calcDiffusion(1, destMatrix, orgMatrix, visc)
    calcDiffusion(2, destMatrix, orgMatrix, visc)
    orgMatrix = destMatrix;
    calcAdvection(1, destMatrix, orgMatrix)
    calcAdvection(2, destMatrix, orgMatrix)
  }

  const dissipate = (dest, src) => {
    let i, j;
    for(i = 1; i <= N; ++i) {
      for(j = 1; j <= N; ++j) {
        dest[IX(i,j)].d = src[IX(i,j)].d*0.99
      }
    }
  }

  const loop = () => {
    renderCanvas()
    let orgMatrix = [...(fluidMatrixRef.current)]
    let destMatrix = [...(fluidMatrixRef.current)]
    let sources = [...(sourcesRef.current)]
    denStep(destMatrix, orgMatrix, sources) 
    velStep(destMatrix, orgMatrix)
    orgMatrix = destMatrix;
    dissipate(destMatrix, orgMatrix)
    setFluidMatrix(destMatrix)
    requestAnimationFrame(loop)
  }

  useEffect(() => {
    if(ctx !== null) {
      requestAnimationFrame(loop)
    }
  }, [ctx])

  return (
    <div className="fluidPage">
      <div className="heading">Fluid Simulation</div>
      <canvas 
        ref={ref} 
        width={ (N + 2) * pixelSize} 
        height={ (N + 2) * pixelSize} 
        style={{
          marginLeft: `calc(50vw - ${(N + 2) * pixelSize/2}px)`
        }}
        className="fluidContainer" 
        onMouseMove={handleAddSources}
        onTouchMove={handleAddSources}
      ></canvas>
    </div>
  )
}

export default Application