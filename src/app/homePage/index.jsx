import { useEffect, useRef, useState } from 'react';
import "./home.scss";

const Vector = {
  x: 0,
  y: 0
}

const Particle = {
  density: 0,
  velocity: {...Vector},
}

const Application = () => {
  const width = 40
  const height = 40
  const k = 0.03
  const pixelSize = 10
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
    const matrix = []
    for(let i = 0; i < height; ++i) {
      const array = []
      for(let j = 0; j < width; ++j)
        array.push({...Particle})
      matrix.push([...array])
    }
    setFluidMatrix(matrix)
  }, [])

  const renderCanvas = () => {
    fluidMatrixRef.current.forEach( (row, rowIndex) => {
      row.forEach( (col, colIndex) => {
        let a = col.density
        ctx.fillStyle = "rgba(0,0,0," + a + ")"
        ctx.fillRect(rowIndex * pixelSize, colIndex * pixelSize, pixelSize, pixelSize)
      }) 
    })
  }

  const calcDiffusion = (temp) => {
    if(temp) {
      for(let n = 0; n < 20; ++n) {
        temp.forEach( (row, i) => {
          row.forEach( (col, j) => {
            if( i > 0 && j > 0 && j < width - 2 && i < height - 2) {
              temp[i][j].density = parseFloat(((col.density + k * (temp[i-1][j].density + temp[i + 1][j].density + temp[i][j + 1].density + temp[i][j - 1].density))/(1 + 4 * k)).toFixed(7))
            }
          }) 
        })    
      }
    }
    return temp
  }

  const addSources = (temp, s) => {
    s.forEach((location) => {
      console.log(location)
      temp[location.y][location.x].density = 1;
    })
    return temp
  }

  const calcAdvection = () => {

  }

  const handleAddSources = (e) => {
    const {offsetTop, offsetLeft} = e.target;
    const {clientX, clientY} = e;
    const tempSource = {y: Math.round((clientX - offsetLeft )/ pixelSize), x: Math.round((clientY - offsetTop) / pixelSize)}
    const temp = [...sources];
    temp.push(tempSource)
    setSources(temp)
  }

  const loop = () => {
    const temp = [...(fluidMatrixRef.current)]
    const s = [...(sourcesRef.current)]
    renderCanvas()
    if(s.length !== 0) {
      addSources(temp, [...s])
      setSources([])
    }
    calcDiffusion(temp)
    calcAdvection()
    setFluidMatrix(temp)
    requestAnimationFrame(loop)
  }

  useEffect(() => {
    if(ctx !== null) {
      requestAnimationFrame(loop)
    }
  }, [ctx])

  return (
    <div>
      <div>Fluid Simulation</div>
      <canvas ref={ref} width={width * pixelSize} height={height * pixelSize} className="fluidContainer" onClick={handleAddSources}></canvas>
    </div>
  )
}

export default Application