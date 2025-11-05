/**
 * Main App Component
 * 
 * Manages navigation between the setup screen and the roasting session screen.
 * Handles session state (bean name, charge temperature, and temperature unit).
 */
import { useState } from 'react'
import MainScreen from './MainScreen'
import RoastingScreen from './RoastingScreen'

/**
 * Session data structure
 */
interface SessionData {
  beanName: string;
  chargeTemp: number;
  unit: 'C' | 'F';
}

function App() {
  // Current roasting session data, null when on setup screen
  const [session, setSession] = useState<SessionData | null>(null);

  /**
   * Handles starting a new roasting session
   * @param beanName - Name of the coffee beans being roasted
   * @param chargeTemp - Initial charge temperature
   * @param unit - Temperature unit ('C' for Celsius or 'F' for Fahrenheit)
   */
  const handleStartSession = (beanName: string, chargeTemp: number, unit: 'C' | 'F') => {
    setSession({ beanName, chargeTemp, unit });
  };

  /**
   * Handles returning to the setup screen
   * Clears the current session data
   */
  const handleBack = () => {
    setSession(null);
  };

  return (
    <div className='full-width center-elements'>
      {session ? (
        // Show roasting screen when a session is active
        <RoastingScreen
          beanName={session.beanName}
          chargeTemp={session.chargeTemp}
          unit={session.unit}
          onBack={handleBack}
        />
      ) : (
        // Show setup screen when no session is active
        <MainScreen onStart={handleStartSession} />
      )}
    </div>
  )
}

export default App
