/**
 * Roasting Screen Component
 * 
 * Main screen during an active roasting session. Displays:
 * - Real-time temperature graph (temperature vs. time)
 * - Manual temperature control buttons (increase/decrease)
 * - Timer with start/stop/lap functionality
 * - Current and charge temperature display
 */
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Data point structure for temperature logging
 */
interface TemperatureDataPoint {
  /** Time in seconds since timer started */
  time: number;
  /** Temperature reading at this time point */
  temperature: number;
}

interface RoastingScreenProps {
  /** Name of the coffee beans being roasted */
  beanName: string;
  /** Initial charge temperature when beans were added */
  chargeTemp: number;
  /** Temperature unit ('C' for Celsius, 'F' for Fahrenheit) */
  unit: 'C' | 'F';
  /** Callback function to return to setup screen */
  onBack: () => void;
}

function RoastingScreen({ beanName, chargeTemp, unit, onBack }: RoastingScreenProps) {
  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Temperature state and data logging
  const [temperatureData, setTemperatureData] = useState<TemperatureDataPoint[]>([
    { time: 0, temperature: chargeTemp } // Initialize with charge temperature at time 0
  ]);
  const [currentTemp, setCurrentTemp] = useState(chargeTemp);
  
  // Refs for managing intervals and accessing current values in callbacks
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTempRef = useRef(currentTemp);
  const secondsRef = useRef(0);
  const isInitialMount = useRef(true);

  /**
   * Reset state when chargeTemp prop changes (e.g., new session started)
   * This ensures state is properly initialized when props change
   * Note: In normal flow, component unmounts/remounts, but this is defensive
   */
  useEffect(() => {
    // Skip on initial mount (state already initialized correctly)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Reset state if chargeTemp changes after initial mount
    setCurrentTemp(chargeTemp);
    setTemperatureData([{ time: 0, temperature: chargeTemp }]);
    setSeconds(0);
    setIsRunning(false);
    // Clear any running interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [chargeTemp]);

  /**
   * Keep refs in sync with state
   * This allows us to access the latest values in interval callbacks
   * without causing the interval to restart when values change
   */
  useEffect(() => {
    currentTempRef.current = currentTemp;
  }, [currentTemp]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  /**
   * Timer effect: Manages the countdown timer and temperature logging
   * When timer is running, logs temperature data every second
   */
  useEffect(() => {
    if (isRunning) {
      // Start interval that runs every second
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1;
          
          // Log current temperature data point every second when timer is running
          // Uses ref to get the latest temperature value without causing re-renders
          // Limit array size to prevent memory issues (keep last 3600 points = 1 hour at 1 second intervals)
          setTemperatureData((prev) => {
            const newData = [...prev, { time: newSeconds, temperature: currentTempRef.current }];
            // Keep only the last 3600 data points to prevent unbounded memory growth
            return newData.length > 3600 ? newData.slice(-3600) : newData;
          });
          return newSeconds;
        });
      }, 1000);
    } else {
      // Stop interval when timer is not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup: clear interval on unmount or when isRunning changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  /**
   * Starts the timer and begins logging temperature data
   */
  const handleStart = () => {
    setIsRunning(true);
  };

  /**
   * Stops the timer and pauses temperature logging
   */
  const handleStop = () => {
    setIsRunning(false);
  };

  /**
   * Logs a lap time with current temperature to console
   * Can be extended to display lap times in the UI
   */
  const handleLap = () => {
    console.log(`Lap time: ${seconds} seconds, Temperature: ${currentTemp.toFixed(1)}°${unit}`);
  };

  /**
   * Increases the current temperature by 1°C or 1.8°F
   * If timer is running, immediately logs the temperature change to the graph
   */
  const handleIncreaseTemp = () => {
    // Temperature increment: 1°C ≈ 1.8°F
    const increment = unit === 'C' ? 1 : 1.8;
    
    setCurrentTemp((prevTemp) => {
      const newTemp = prevTemp + increment;
      
      // If timer is running, log the temperature change immediately
      // Use secondsRef to get the current value, not stale closure value
      if (isRunning) {
        setTemperatureData((prev) => {
          const newData = [...prev, { time: secondsRef.current, temperature: newTemp }];
          // Keep only the last 3600 data points to prevent unbounded memory growth
          return newData.length > 3600 ? newData.slice(-3600) : newData;
        });
      }
      return newTemp;
    });
  };

  /**
   * Decreases the current temperature by 1°C or 1.8°F
   * Prevents temperature from going below 0
   * If timer is running, immediately logs the temperature change to the graph
   */
  const handleDecreaseTemp = () => {
    // Temperature decrement: 1°C ≈ 1.8°F
    const decrement = unit === 'C' ? 1 : 1.8;
    
    setCurrentTemp((prevTemp) => {
      // Prevent negative temperatures
      const newTemp = Math.max(0, prevTemp - decrement);
      
      // If timer is running, log the temperature change immediately
      // Use secondsRef to get the current value, not stale closure value
      if (isRunning) {
        setTemperatureData((prev) => {
          const newData = [...prev, { time: secondsRef.current, temperature: newTemp }];
          // Keep only the last 3600 data points to prevent unbounded memory growth
          return newData.length > 3600 ? newData.slice(-3600) : newData;
        });
      }
      return newTemp;
    });
  };

  /**
   * Formats seconds into MM:SS format
   * @param totalSeconds - Total number of seconds
   * @returns Formatted time string (e.g., "05:30" for 330 seconds)
   */
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>{beanName} - Roasting Session</h1>
        <button onClick={onBack}>
          Back to Setup
        </button>
      </div>

      <div className="screen-content">
        <h2>
          Current Temperature: {currentTemp.toFixed(1)}°{unit}
        </h2>
        <p>
          Charge Temperature: {chargeTemp.toFixed(1)}°{unit}
        </p>
        <div className="button-group">
          <button
            onClick={handleDecreaseTemp}
            className="button-large"
          >
            - Decrease
          </button>
          <button
            onClick={handleIncreaseTemp}
            className="button-large"
          >
            + Increase
          </button>
        </div>
      </div>

      <div className="graph-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis 
              dataKey="time" 
              stroke="#ffffff"
              tick={{ fill: '#ffffff' }}
              label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5, fill: '#ffffff' }}
            />
            <YAxis 
              stroke="#ffffff"
              tick={{ fill: '#ffffff' }}
              label={{ value: `Temperature (°${unit})`, angle: -90, position: 'insideLeft', fill: '#ffffff' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff', color: '#ffffff' }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Legend wrapperStyle={{ color: '#ffffff' }} />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#ffffff" 
              strokeWidth={2}
              dot={{ fill: '#ffffff', r: 3 }}
              name={`Temperature (°${unit})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="center-elements">
        <h2>Time: {formatTime(seconds)}</h2>

        <div className="timer-controls">
          <button
            className="round-button"
            onClick={handleStart}
            disabled={isRunning}
          >
            Start
          </button>
          <button
            className="round-button"
            onClick={handleStop}
            disabled={!isRunning}
          >
            Stop
          </button>
          <button
            className="round-button"
            onClick={handleLap}
            disabled={!isRunning}
          >
            Lap
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoastingScreen;

