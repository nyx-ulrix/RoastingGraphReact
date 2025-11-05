/**
 * Main App Component
 * 
 * Manages navigation between setup, roasting, and summary screens.
 * Handles session state including bean name, temperatures, first crack time, and DTR data.
 */
import { useState, useCallback } from 'react'
import MainScreen from './MainScreen'
import RoastingScreen from './RoastingScreen'
import SummaryScreen from './SummaryScreen'

/**
 * Session data structure
 */
interface SessionData {
  beanName: string;
  chargeTemp: number;
  unit: 'C' | 'F';
}

/**
 * Temperature data point structure
 */
interface TemperatureDataPoint {
  time: number;
  temperature: number;
}

/**
 * Summary data structure with first crack time for DTR calculation
 */
interface SummaryData {
  beanName: string;
  chargeTemp: number;
  unit: 'C' | 'F';
  temperatureData: TemperatureDataPoint[];
  totalTime: number;
  firstCrackTime: number | null;
}

function App() {
  // Current roasting session data, null when on setup screen
  const [session, setSession] = useState<SessionData | null>(null);
  // Summary data for completed session
  const [summary, setSummary] = useState<SummaryData | null>(null);

  /**
   * Starts a new roasting session with provided parameters
   */
  const handleStartSession = useCallback((beanName: string, chargeTemp: number, unit: 'C' | 'F') => {
    setSession({ beanName, chargeTemp, unit });
    setSummary(null);
  }, []);

  /**
   * Ends the roasting session and navigates to summary screen
   */
  const handleEndSession = useCallback((data: { temperatureData: TemperatureDataPoint[], totalTime: number, firstCrackTime: number | null }) => {
    if (session) {
      setSummary({
        beanName: session.beanName,
        chargeTemp: session.chargeTemp,
        unit: session.unit,
        temperatureData: data.temperatureData,
        totalTime: data.totalTime,
        firstCrackTime: data.firstCrackTime
      });
      setSession(null);
    }
  }, [session]);

  /**
   * Returns to the setup screen and clears all data
   */
  const handleBackToSetup = useCallback(() => {
    setSession(null);
    setSummary(null);
  }, []);

  return (
    <div className='full-width center-elements'>
      {summary ? (
        // Show summary screen when session is complete
        <SummaryScreen
          beanName={summary.beanName}
          chargeTemp={summary.chargeTemp}
          unit={summary.unit}
          temperatureData={summary.temperatureData}
          totalTime={summary.totalTime}
          firstCrackTime={summary.firstCrackTime}
          onBackToSetup={handleBackToSetup}
        />
      ) : session ? (
        // Show roasting screen when a session is active
        <RoastingScreen
          beanName={session.beanName}
          chargeTemp={session.chargeTemp}
          unit={session.unit}
          onBack={handleEndSession}
        />
      ) : (
        // Show setup screen when no session is active
        <MainScreen onStart={handleStartSession} />
      )}
    </div>
  )
}

export default App
