/**
 * Roasting Screen Component
 * 
 * Main screen during an active roasting session. Displays:
 * - Real-time temperature graph (temperature vs. time)
 * - Manual temperature control buttons (increase/decrease)
 * - Timer with start/stop/first crack functionality
 * - Current and charge temperature display
 * - Development Time Ratio (DTR) progress bar
 */
import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { calculateDTR, getDTRColor } from './utils/dtrCalculations';

/**
 * Data point structure for temperature logging
 */
interface TemperatureDataPoint {
  /** Time in seconds since timer started */
  time: number;
  /** Temperature reading at this time point */
  temperature: number;
}

/**
 * Session state structure for localStorage persistence
 */
interface SessionState {
  beanName: string;
  chargeTemp: number;
  unit: 'C' | 'F';
  temperatureData: TemperatureDataPoint[];
  currentTemp: number;
  seconds: number;
  isRunning: boolean;
  startTime: number | null;
  firstCrackTime: number | null;
  roastStage: 'ready' | 'started' | 'firstCrack' | 'ended';
}

interface RoastingScreenProps {
  /** Name of the coffee beans being roasted */
  beanName: string;
  /** Initial charge temperature when beans were added */
  chargeTemp: number;
  /** Temperature unit ('C' for Celsius, 'F' for Fahrenheit) */
  unit: 'C' | 'F';
  /** Callback function to end session and show summary */
  onBack: (data: { temperatureData: TemperatureDataPoint[], totalTime: number, firstCrackTime: number | null }) => void;
}

function RoastingScreen({ beanName, chargeTemp, unit, onBack }: RoastingScreenProps) {
  // Timer state - using Date.now() for accuracy
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [firstCrackTime, setFirstCrackTime] = useState<number | null>(null);
  const [roastStage, setRoastStage] = useState<'ready' | 'started' | 'firstCrack' | 'ended'>('ready');
  
  // Temperature state and data logging
  const [temperatureData, setTemperatureData] = useState<TemperatureDataPoint[]>([
    { time: 0, temperature: chargeTemp } // Initialize with charge temperature at time 0
  ]);
  const [currentTemp, setCurrentTemp] = useState(chargeTemp);
  
  // Refs for managing intervals and accessing current values in callbacks
  const intervalRef = useRef<number | null>(null);
  const currentTempRef = useRef(currentTemp);
  const isInitialMount = useRef(true);
  const sessionKeyRef = useRef(`roasting_session_${beanName}_${Date.now()}`);

  /**
   * Load saved session from localStorage on mount and auto-start timer
   */
  useEffect(() => {
    const savedSession = localStorage.getItem(sessionKeyRef.current);
    if (savedSession) {
      try {
        const state: SessionState = JSON.parse(savedSession);
        // Restore state from localStorage
        setTemperatureData(state.temperatureData);
        setCurrentTemp(state.currentTemp);
        setSeconds(state.seconds);
        setFirstCrackTime(state.firstCrackTime);
        setRoastStage(state.roastStage);
        // Don't automatically resume timer, let user restart
        setIsRunning(false);
        setStartTime(null);
      } catch (error) {
        console.error('Failed to load saved session:', error);
      }
    } else {
      // Auto-start timer for new sessions
      setStartTime(Date.now());
      setIsRunning(true);
      setRoastStage('started');
    }
    isInitialMount.current = false;
  }, []); // Only run once on mount

  /**
   * Save session to localStorage whenever state changes
   */
  useEffect(() => {
    if (!isInitialMount.current) {
      const state: SessionState = {
        beanName,
        chargeTemp,
        unit,
        temperatureData,
        currentTemp,
        seconds,
        isRunning: false, // Never save running state
        startTime: null,
        firstCrackTime,
        roastStage,
      };
      localStorage.setItem(sessionKeyRef.current, JSON.stringify(state));
    }
  }, [beanName, chargeTemp, unit, temperatureData, currentTemp, seconds, firstCrackTime, roastStage]);

  /**
   * Cleanup effect: Clear interval timer when component unmounts
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Sync temperature ref with state for access in interval callback
   */
  useEffect(() => {
    currentTempRef.current = currentTemp;
  }, [currentTemp]);

  /**
   * Timer effect: Manages timer and temperature logging with Date.now() for accuracy
   * Updates every 100ms for smooth display, logs data points every second
   */
  useEffect(() => {
    if (isRunning && startTime !== null) {
      intervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(elapsed);
        
        // Log temperature data point only when elapsed time increases (prevents duplicates)
        setTemperatureData((prev) => {
          const lastTime = prev.length > 0 ? prev[prev.length - 1].time : -1;
          if (elapsed > lastTime) {
            const newData = [...prev, { time: elapsed, temperature: currentTempRef.current }];
            // Keep last 3600 points (1 hour at 1 second intervals) to prevent memory issues
            return newData.length > 3600 ? newData.slice(-3600) : newData;
          }
          return prev;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  /**
   * Starts the timer and begins logging temperature data
   */
  const handleStart = () => {
    if (!isRunning && roastStage === 'ready') {
      setStartTime(Date.now() - seconds * 1000);
      setIsRunning(true);
      setRoastStage('started');
    }
  };

  /**
   * Marks the first crack time for DTR calculation
   */
  const handleFirstCrack = () => {
    if (roastStage === 'started') {
      setFirstCrackTime(seconds);
      setRoastStage('firstCrack');
    }
  };

  /**
   * Increases current temperature by 1°C or 1.8°F
   */
  const handleIncreaseTemp = () => {
    const increment = unit === 'C' ? 1 : 1.8;
    setCurrentTemp((prevTemp) => prevTemp + increment);
  };

  /**
   * Decreases current temperature by 1°C or 1.8°F (minimum 0)
   */
  const handleDecreaseTemp = () => {
    const decrement = unit === 'C' ? 1 : 1.8;
    setCurrentTemp((prevTemp) => Math.max(0, prevTemp - decrement));
  };


  /**
   * Ends the session and navigates to summary screen
   */
  const handleBackWithConfirmation = () => {
    // Stop the timer
    setIsRunning(false);
    setRoastStage('ended');
    
    // Clear localStorage for this session
    localStorage.removeItem(sessionKeyRef.current);
    
    // Pass all session data to parent
    onBack({ temperatureData, totalTime: seconds, firstCrackTime });
  };


  /**
   * Formats seconds into MM:SS format
   */
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Formats seconds to minutes for X-axis display (minutes only)
   */
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  /**
   * Calculate the minimum and maximum temperatures from data
   */
  const minTemp = Math.min(...temperatureData.map(d => d.temperature));
  const maxTemp = Math.max(...temperatureData.map(d => d.temperature));

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>{beanName}</h1>
      </div>

      <div className="graph-wrapper">
        <div className="graph-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis 
                dataKey="time" 
                stroke="#ffffff"
                tick={{ fill: '#ffffff' }}
                tickFormatter={formatMinutes}
                label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5, fill: '#ffffff' }}
                interval="preserveStartEnd"
                allowDecimals={false}
                ticks={temperatureData.length > 0 ? Array.from(
                  { length: Math.floor(temperatureData[temperatureData.length - 1].time / 60) + 2 }, 
                  (_, i) => i * 60
                ).filter(tick => tick <= temperatureData[temperatureData.length - 1].time + 60) : [0]}
              />
              <YAxis 
                stroke="#ffffff"
                tick={{ fill: '#ffffff' }}
                label={{ value: `Temperature (°${unit})`, angle: -90, position: 'insideLeft', fill: '#ffffff' }}
                domain={[Math.floor(minTemp - 5), Math.ceil(maxTemp + 5)]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff', color: '#ffffff' }}
                labelStyle={{ color: '#ffffff' }}
                labelFormatter={(value) => `Time: ${formatMinutes(value as number)}`}
              />
              <Legend wrapperStyle={{ color: '#ffffff' }} />
              {firstCrackTime !== null && (
                <ReferenceLine 
                  x={firstCrackTime} 
                  stroke="#ffaa00" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: 'First Crack', position: 'top', fill: '#ffaa00', fontSize: 12 }}
                />
              )}
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
      </div>

      <div className="dtr-section">
        <div className="dtr-label">DTR</div>
        <div className="dtr-progress-container">
          <div 
            className="dtr-progress-bar" 
            style={{ 
              width: `${calculateDTR(firstCrackTime, seconds)}%`,
              backgroundColor: getDTRColor(calculateDTR(firstCrackTime, seconds))
            }}
          />
          <div className="dtr-progress-text">
            {calculateDTR(firstCrackTime, seconds).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="timer-wrapper">
        <div className="temperature-display">
          <div className="current-temp">Current: {currentTemp.toFixed(1)}°{unit}</div>
          <div className="charge-temp">Charge: {chargeTemp.toFixed(1)}°{unit}</div>
        </div>
        <h2 className="timer-display">Time: {formatTime(seconds)}</h2>
      </div>

      <div className="controls-wrapper">
        <button 
          onClick={() => {
            if (roastStage === 'ready') {
              handleStart();
            } else if (roastStage === 'started') {
              handleFirstCrack();
            } else if (roastStage === 'firstCrack') {
              handleBackWithConfirmation();
            }
          }}
          className={
            roastStage === 'ready' ? 'session-button session-button-start' :
            roastStage === 'started' ? 'session-button session-button-firstcrack' :
            'session-button session-button-stop'
          }
        >
          {roastStage === 'ready' ? 'Start' : roastStage === 'started' ? 'First Crack' : 'End'}
        </button>
        <div className="temp-controls-container">
          <button onClick={handleIncreaseTemp} className="temp-control-button">
            + Increase
          </button>
          <button onClick={handleDecreaseTemp} className="temp-control-button">
            - Decrease
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoastingScreen;
