/**
 * Export Utilities
 * 
 * Provides functions for exporting roasting session data as CSV and JSON files.
 */

interface TemperatureDataPoint {
  time: number;
  temperature: number;
}

/**
 * Format seconds into MM:SS format
 * 
 * @param totalSeconds - Time in seconds
 * @returns Formatted string (e.g., "05:23")
 */
export const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Export roasting session data as CSV file
 * 
 * @param beanName - Name of the coffee beans
 * @param chargeTemp - Initial charge temperature
 * @param finalTemp - Final roast temperature
 * @param unit - Temperature unit ('C' or 'F')
 * @param totalTime - Total roast time in seconds
 * @param firstCrackTime - Time of first crack in seconds (null if not recorded)
 * @param dtr - Development Time Ratio as percentage
 * @param temperatureData - Array of temperature data points
 */
export const exportToCSV = (
  beanName: string,
  chargeTemp: number,
  finalTemp: number,
  unit: 'C' | 'F',
  totalTime: number,
  firstCrackTime: number | null,
  dtr: number,
  temperatureData: TemperatureDataPoint[]
): void => {
  const header = [
    'Session Summary',
    `Bean: ${beanName}`,
    `Total Time: ${formatTime(totalTime)}`,
    `Charge Temp: ${chargeTemp.toFixed(1)}°${unit}`,
    `Final Temp: ${finalTemp.toFixed(1)}°${unit}`,
    `First Crack Time: ${firstCrackTime !== null ? formatTime(firstCrackTime) : 'N/A'}`,
    `Development Time Ratio: ${firstCrackTime !== null ? dtr.toFixed(1) + '%' : 'N/A'}`,
    '',
    'Time (seconds),Temperature (°' + unit + ')'
  ].join('\n');
  
  const dataRows = temperatureData.map(point => 
    [point.time, point.temperature.toFixed(1)].join(',')
  ).join('\n');
  
  const csvContent = header + '\n' + dataRows;
  downloadFile(csvContent, 'text/csv;charset=utf-8;', 'csv', beanName);
};

/**
 * Export roasting session data as JSON file
 * 
 * @param beanName - Name of the coffee beans
 * @param chargeTemp - Initial charge temperature
 * @param finalTemp - Final roast temperature
 * @param minTemp - Minimum recorded temperature
 * @param maxTemp - Maximum recorded temperature
 * @param unit - Temperature unit ('C' or 'F')
 * @param totalTime - Total roast time in seconds
 * @param firstCrackTime - Time of first crack in seconds (null if not recorded)
 * @param dtr - Development Time Ratio as percentage
 * @param temperatureData - Array of temperature data points
 */
export const exportToJSON = (
  beanName: string,
  chargeTemp: number,
  finalTemp: number,
  minTemp: number,
  maxTemp: number,
  unit: 'C' | 'F',
  totalTime: number,
  firstCrackTime: number | null,
  dtr: number,
  temperatureData: TemperatureDataPoint[]
): void => {
  const jsonData = {
    beanName,
    chargeTemp,
    unit,
    totalTime,
    firstCrackTime,
    developmentTimeRatio: firstCrackTime !== null ? dtr : null,
    finalTemperature: finalTemp,
    minTemperature: minTemp,
    maxTemperature: maxTemp,
    temperatureData,
    exportDate: new Date().toISOString()
  };

  downloadFile(JSON.stringify(jsonData, null, 2), 'application/json', 'json', beanName);
};

/**
 * Trigger file download in browser
 * 
 * @param content - File content as string
 * @param mimeType - MIME type of the file
 * @param extension - File extension (without dot)
 * @param beanName - Bean name for filename
 */
const downloadFile = (content: string, mimeType: string, extension: string, beanName: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${beanName}_roast_${new Date().toISOString().slice(0, 10)}.${extension}`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


