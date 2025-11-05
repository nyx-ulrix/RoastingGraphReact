/**
 * Main Screen Component
 * 
 * Initial setup screen where users enter:
 * - Bean name
 * - Charge temperature (initial temperature when beans are added)
 * - Temperature unit (Celsius or Fahrenheit)
 */
import { useState, memo } from 'react';

interface MainScreenProps {
  /** Callback function called when user submits the form to start a roasting session */
  onStart: (beanName: string, chargeTemp: number, unit: 'C' | 'F') => void;
}

const MainScreen = memo(function MainScreen({ onStart }: MainScreenProps) {
  // Form state
  const [beanName, setBeanName] = useState('');
  const [chargeTemp, setChargeTemp] = useState('');
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  /**
   * Handles form submission
   * Validates input and starts the roasting session if valid
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const temp = parseFloat(chargeTemp);
    
    // Validate: bean name must not be empty, temperature must be a valid positive number
    if (beanName.trim() && !isNaN(temp) && temp > 0) {
      onStart(beanName.trim(), temp, unit);
    }
  };

  return (
    <div className="flex-container" style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px'
    }}>
      <h1>Roasting Session Setup</h1>
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="beanName" className="form-label">
            Bean Name:
          </label>
          <input
            id="beanName"
            type="text"
            value={beanName}
            onChange={(e) => setBeanName(e.target.value)}
            placeholder="Enter bean name"
            autoComplete="off"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="chargeTemp" className="form-label">
            Charge Temperature:
          </label>
          <input
            id="chargeTemp"
            type="number"
            value={chargeTemp}
            onChange={(e) => setChargeTemp(e.target.value)}
            placeholder="Enter charge temperature"
            autoComplete="off"
            required
            min="0"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Temperature Unit:
          </label>
          <div className="form-radio-group">
            <label className="form-label-inline">
              <input
                type="radio"
                value="C"
                checked={unit === 'C'}
                onChange={(e) => setUnit(e.target.value as 'C' | 'F')}
              />
              <span>Celsius (°C)</span>
            </label>
            <label className="form-label-inline">
              <input
                type="radio"
                value="F"
                checked={unit === 'F'}
                onChange={(e) => setUnit(e.target.value as 'C' | 'F')}
              />
              <span>Fahrenheit (°F)</span>
            </label>
          </div>
        </div>

        <button type="submit">
          Start Roasting Session
        </button>
      </form>
    </div>
  );
});

export default MainScreen;
