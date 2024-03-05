import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./style.css";

const SpinWheelApp = () => {
  const [result, setResult] = useState();
  const wheelRef = useRef(null);
  const spinBtnRef = useRef(null);
  const finalValueRef = useRef(null);
  const [numSegments, setNumSegments] = useState(2); // State to track number of segments

  useEffect(() => {
    function generateRotationValues(num) {
      const fullCircle = 360;
      const degreeSpan = fullCircle / num;
      const rotationValues = [];

      let previousEndDegree = 0; // Initialize the previous end degree

      for (let i = 0; i < num; i++) {
        const startDegree = previousEndDegree + 1; // Start degree of the current segment
        const endDegree = startDegree + degreeSpan - 1; // End degree of the current segment

        const rotationSegment = {
          minDegree: startDegree,
          maxDegree: endDegree,
          value: i + 1,
        };

        rotationValues.push(rotationSegment);

        previousEndDegree = endDegree; // Update the previous end degree for the next iteration
      }

      return rotationValues;
    }

    const rotationValues = generateRotationValues(numSegments);

    console.log({ rotationValues });

    const data = Array.from({ length: numSegments }, () => 16); // Create an array with 'numSegments' number of elements each with a value of 16
    const pieColors = Array.from({ length: numSegments * 2 }, (_, i) =>
      i % 2 === 0 ? "#8b35bc" : "#b163da"
    );

    const wheel = wheelRef.current;
    const spinBtn = spinBtnRef.current;
    const finalValue = finalValueRef.current;

    const spinPointer = {
      id: "spinPointer",
      afterDatasetsDraw(chart, args, plugins) {
        const {
          ctx,
          chartArea: { top },
        } = chart;
        const xCenter = chart.getDatasetMeta(0).data[0].x;

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "gold";
        ctx.moveTo(xCenter, top + 30);
        ctx.lineTo(xCenter - 15, top);
        ctx.lineTo(xCenter + 15, top);
        ctx.fill();
      },
    };

    let myChart = new Chart(wheel, {
      plugins: [ChartDataLabels, spinPointer],
      type: "pie",
      data: {
        labels: Array.from({ length: numSegments }, (_, i) => i + 1), // Generate labels dynamically
        datasets: [{ backgroundColor: pieColors, data: data }],
      },
      options: {
        responsive: true,
        animation: { duration: 1 },
        plugins: {
          tooltip: false,
          legend: { display: false },
          datalabels: {
            color: "#ffffff",
            formatter: (_, context) =>
              context.chart.data.labels[context.dataIndex],
            font: { size: 24 },
          },
        },
      },
    });

    function rotation() {
      // Calculate the total degrees for two complete rotations
      const totalDegrees = 360 * 6;

      // Set a random final rotation angle that is at least two complete rotations
      const finalRotation = 360 * 10 + Math.random() * 10000; // Allows for 10 complete rotations and adds some randomness

      // Define the initial rotation
      let currentRotation = myChart.config.data.datasets[0].rotation || 0;

      // Define the initial increment for each frame
      let increment = 50;

      // Define the deceleration rate
      const deceleration = 0.98;

      // Define a function to animate the spinning
      function animateSpin() {
        // Increase the rotation angle by the increment
        currentRotation += increment;

        // Update the chart with the new rotation angle
        myChart.config.data.datasets[0].rotation = currentRotation;
        myChart.update();

        // Gradually reduce the increment to simulate deceleration
        increment *= deceleration;

        // Check if the final rotation angle is reached or increment becomes very small
        if (currentRotation < finalRotation && increment > 0.1) {
          // Continue animating
          requestAnimationFrame(animateSpin);
        } else {
          // Stop spinning and determine the selected segment
          determineSelectedSegment();
        }
      }

      // Start the spinning animation
      animateSpin();
    }

    function determineSelectedSegment() {
      const angle = 180 / Math.PI;
      let selectedIndex = -1;

      myChart.getDatasetMeta(0).data.forEach((datapoint, index) => {
        const netStartAngle = (datapoint.startAngle * angle) % 360;
        const netEndAngle = (datapoint.endAngle * angle) % 360;

        // Assuming 270 degrees is the indicator's position
        if (270 > netStartAngle && 270 < netEndAngle) {
          selectedIndex = index + 1; // Output the selected segment index
        }
      });

      setResult(selectedIndex);

      console.log("Selected Segment:", selectedIndex);
    }

    spinBtn.addEventListener("click", rotation);

    return () => {
      spinBtn.removeEventListener("click", rotation);
      myChart.destroy();
    };
  }, [numSegments]);

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value, 10); // Parse the input value as an integer
    if (!isNaN(value)) {
      setNumSegments(value); // Update the number of segments
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        <canvas ref={wheelRef} id="wheel"></canvas>
        <button ref={spinBtnRef} id="spin-btn">
          Spin
        </button>
        <input
          type="number"
          value={numSegments}
          onChange={handleInputChange}
          min="1"
        />
      </div>
      <div id="final-value">
        {result ? result : <p>Click On The Spin Button To Start</p>}
      </div>
    </div>
  );
};

export default SpinWheelApp;
