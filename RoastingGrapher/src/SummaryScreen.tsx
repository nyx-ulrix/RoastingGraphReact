/**
 * Summary Screen Component
 * 
 * Displays the final roasting session summary with:
 * - Complete temperature graph with first crack indicator
 * - Session statistics (times, temperatures, DTR)
 * - Export functionality (CSV/JSON)
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { calculateDTR } from './utils/dtrCalculations';
import { exportToCSV, exportToJSON, formatTime } from './utils/exportUtils';

interface TemperatureDataPoint {
  time: number;
  temperature: number;
}

interface SummaryScreenProps {
  beanName: string;
  chargeTemp: number;
  unit: 'C' | 'F';
  temperatureData: TemperatureDataPoint[];
  totalTime: number;
  firstCrackTime: number | null;
  onBackToSetup: () => void;
}

function SummaryScreen({ beanName, chargeTemp, unit, temperatureData, totalTime, firstCrackTime, onBackToSetup }: SummaryScreenProps) {
  /**
   * Formats seconds to minutes for X-axis display (minutes only)
   */
  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  /**
   * Calculate min, max, and final temperatures from data
   */
  const minTemp = Math.min(...temperatureData.map(d => d.temperature));
  const maxTemp = Math.max(...temperatureData.map(d => d.temperature));
  const finalTemp = temperatureData[temperatureData.length - 1]?.temperature || chargeTemp;

  /**
   * Calculate DTR for display
   */
  const dtr = calculateDTR(firstCrackTime, totalTime);

  /**
   * Handle CSV export
   */
  const handleExportCSV = () => {
    exportToCSV(beanName, chargeTemp, finalTemp, unit, totalTime, firstCrackTime, dtr, temperatureData);
  };

  /**
   * Handle JSON export
   */
  const handleExportJSON = () => {
    exportToJSON(beanName, chargeTemp, finalTemp, minTemp, maxTemp, unit, totalTime, firstCrackTime, dtr, temperatureData);
  };

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

      <div className="screen-content">
        <h2>Roast Complete!</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0' }}>
          <p><strong>Total Time:</strong> {formatTime(totalTime)}</p>
          {firstCrackTime !== null && (
            <p><strong>First Crack Time:</strong> {formatTime(firstCrackTime)}</p>
          )}
          <p><strong>Charge Temp:</strong> {chargeTemp.toFixed(1)}°{unit}</p>
          <p><strong>Final Temp:</strong> {finalTemp.toFixed(1)}°{unit}</p>
          {firstCrackTime !== null && (
            <p><strong>DTR:</strong> {dtr.toFixed(1)}%</p>
          )}
        </div>
      </div>

      <div className="center-elements">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={handleExportCSV} style={{ width: '100%' }}>
            Export CSV
          </button>
          <button onClick={handleExportJSON} style={{ width: '100%' }}>
            Export JSON
          </button>
          <button onClick={onBackToSetup} style={{ width: '100%' }}>
            Back to Setup
          </button>
        </div>
      </div>
    </div>
  );
}

export default SummaryScreen;

