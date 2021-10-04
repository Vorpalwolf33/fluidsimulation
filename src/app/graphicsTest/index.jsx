import { useState, useEffect } from 'react';
import { GPU } from 'gpu.js';
import "./graphicsTest.scss";

const Graphics = () => {
  const gpu = new GPU();
  const [times, setTimes] = useState([])
  const [matrixSize, setMatrixSize] = useState(1)

  const cpuMultiplyMatrix = (matrix1, matrix2, matrixSize) => {
    const startTime = performance.now()
    const matrix3 = generateMatrix(matrixSize, matrixSize, 0)
    let i, j, k;
    for(i = 0; i < matrixSize; ++i) {
      for(j = 0; j < matrixSize; ++j) {
        for(k = 0; k < matrixSize; ++k) {
          matrix3[i][j] += matrix1[i][k] * matrix2[k][j];
        }
      }
    }
    const endTime = performance.now();
    const cpuTime = (endTime - startTime) + "ms"
    console.log("CPU time: ", cpuTime)
  }

  const gpuMultipleMatrix = (matrix1, matrix2, matrixSize) => {
    const multiplyMatrix = gpu.createKernel(function(a, b){
      let sum = 0;
      for(let i = 0; i < 10; ++i) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
      }
      return sum;
    }, {output: [matrixSize, matrixSize]})
    multiplyMatrix(matrix1, matrix2)
  }

  const generateMatrix = (m, n, k) => {
    let i, j;
    const tempMatrix = []
    for(i = 0; i < m; ++i) {
      tempMatrix.push([])
      if(k === undefined)
        for(j = 0; j < n; ++j) {
          tempMatrix[i].push(Math.random())
        }
      else 
      for(j = 0; j < n; ++j) {
        tempMatrix[i].push(k)
      }
    }
    return tempMatrix;
  }

  // useEffect(() => {
  //   for(let i = 1; i <= 3; ++i) {
  //     const matrixSize = 1 * Math.pow(10, i)
      
  //   }
  // }, [])

  useEffect(() => {
    if(matrixSize) {
      const matrix1 = generateMatrix(matrixSize, matrixSize)
      const matrix2 = generateMatrix(matrixSize, matrixSize)
      let startTime, endTime;
      const time = {size: matrixSize, cpuTime: 0, gpuTime: 0}
      startTime = performance.now()
      cpuMultiplyMatrix(matrix1, matrix2, matrixSize)
      endTime = performance.now();
      time.cpuTime = endTime - startTime;
      
      startTime = performance.now()
      gpuMultipleMatrix(matrix1, matrix2, matrixSize)
      endTime = performance.now()
      time.gpuTime = endTime - startTime

      setTimes([...times, time])
      if(matrixSize < 1000)
        setMatrixSize(matrixSize * 10)
    }
  }, [matrixSize])



  return (
    <div className="application">
      <div className="testHeader">Matrix Multiplication Test</div>
      <div className="testResultsContainer">
        {times && times.map((ele, index) => {
          return (
            <div className="testResultCard">
              <div className="resultCardHeader">Matrix Size<br/> {ele.size}</div>
              <div className="cpuTime">CPU Time: {ele.cpuTime}ms</div>
              <div className="gpuTime">GPU Time: {ele.gpuTime}ms</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Graphics