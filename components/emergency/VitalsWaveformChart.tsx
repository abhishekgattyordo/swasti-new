// components/emergency/VitalsWaveformChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface VitalsWaveformChartProps {
  data: any[];
  vitalType: 'heartRate' | 'bloodPressure' | 'respiratoryRate' | 'spo2' | 'temperature';
  color?: string;
}

export function VitalsWaveformChart({ data, vitalType, color = '#ef4444' }: VitalsWaveformChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Helper function to safely get numeric value
    const getSafeNumber = (value: any, defaultValue: number = 0): number => {
      if (value === undefined || value === null || value === '') {
        return defaultValue;
      }
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    // Prepare labels and values from REAL data with NaN handling
    const validDataPoints: { label: string; value: number; originalIndex: number }[] = [];
    
    data.forEach((item, index) => {
      let value: number;
      
      switch(vitalType) {
        case 'heartRate':
          value = getSafeNumber(item.heartRate);
          break;
        case 'bloodPressure':
          const systolic = getSafeNumber(item.systolic, 120);
          const diastolic = getSafeNumber(item.diastolic, 80);
          value = (systolic + diastolic) / 2;
          break;
        case 'respiratoryRate':
          value = getSafeNumber(item.respiratoryRate, 16);
          break;
        case 'spo2':
          value = getSafeNumber(item.spO2, 98);
          break;
        case 'temperature':
          value = getSafeNumber(item.temperature, 36.5);
          break;
        default:
          value = 0;
      }
      
      // Get time label safely
      let label = ` ${index + ""}`;
      if (item.fullDateTime) {
        try {
          const date = new Date(item.fullDateTime);
          if (!isNaN(date.getTime())) {
            label = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          }
        } catch (e) {
          label = `Reading ${index + 1}`;
        }
      }
      
      validDataPoints.push({ label, value, originalIndex: index });
    });

    const labels = validDataPoints.map(p => p.label);
    const values = validDataPoints.map(p => p.value);

    if (values.length === 0) {
      return;
    }

    let yAxisLabel: string;
    let yAxisUnit: string;
    
    switch(vitalType) {
      case 'heartRate':
        yAxisLabel = 'Heart Rate';
        yAxisUnit = 'bpm';
        break;
      case 'bloodPressure':
        yAxisLabel = 'Mean Arterial Pressure';
        yAxisUnit = 'mmHg';
        break;
      case 'respiratoryRate':
        yAxisLabel = 'Respiratory Rate';
        yAxisUnit = 'breaths/min';
        break;
      case 'spo2':
        yAxisLabel = 'SpO₂';
        yAxisUnit = '%';
        break;
      case 'temperature':
        yAxisLabel = 'Temperature';
        yAxisUnit = '°C';
        break;
      default:
        yAxisLabel = '';
        yAxisUnit = '';
    }

    // Calculate min/max with padding, filtering out any remaining invalid values
    const validValues = values.filter(v => !isNaN(v) && isFinite(v));
    if (validValues.length === 0) {
      return;
    }
    
    const minValue = Math.min(...validValues);
    const maxValue = Math.max(...validValues);
    const padding = (maxValue - minValue) * 0.1 || 10;
    const yMin = Math.max(0, minValue - padding);
    const yMax = maxValue + padding;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${yAxisLabel} (${yAxisUnit})`,
          data: values,
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.3,
          spanGaps: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const rawValue = context.raw;
                const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
                if (isNaN(value) || value === null || value === undefined) {
                  return 'No data';
                }
                return `${yAxisLabel}: ${value.toFixed(1)} ${yAxisUnit}`;
              }
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 11 }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
              color: '#6b7280',
              font: { size: 11 }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 8
            }
          },
          y: {
            title: {
              display: true,
              text: `${yAxisLabel} (${yAxisUnit})`,
              color: '#6b7280',
              font: { size: 11 }
            },
            min: yMin,
            max: yMax,
            grid: {
              color: '#e5e7eb'
            },
            ticks: {
              callback: (tickValue: string | number) => {
                const num = typeof tickValue === 'number' ? tickValue : Number(tickValue);
                if (isNaN(num)) return 'N/A';
                return num;
              }
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, vitalType, color]);

  if (data.length === 0) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
        No vitals data available
      </div>
    );
  }

  return (
    <div className="w-full h-[250px]">
      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}