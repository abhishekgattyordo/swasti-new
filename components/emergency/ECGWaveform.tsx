// components/ECGWaveform.tsx
'use client';

import { useEffect, useRef } from 'react';

interface ECGWaveformProps {
  heartRate: number;
  color?: string;
}

export function ECGWaveform({ heartRate, color = '#ef4444' }: ECGWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let offset = 0;
    const speed = 2;
    
    const drawECG = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      const centerY = height / 2;
      const beatInterval = (60 / heartRate) * 60; // Seconds per beat
      const pixelsPerSecond = 50;
      
      for (let x = 0; x < width; x++) {
        const time = (x + offset) / pixelsPerSecond;
        const beatPhase = (time % beatInterval) / beatInterval;
        
        let y = centerY;
        
        // ECG waveform pattern
        if (beatPhase < 0.1) {
          // P wave
          y = centerY - 10 * Math.sin(beatPhase * Math.PI * 10);
        } else if (beatPhase < 0.2) {
          // PR segment
          y = centerY;
        } else if (beatPhase < 0.3) {
          // QRS complex
          const qrsPhase = (beatPhase - 0.2) / 0.1;
          if (qrsPhase < 0.2) {
            y = centerY - 20 * qrsPhase * 5;
          } else if (qrsPhase < 0.4) {
            y = centerY - 100 + (qrsPhase - 0.2) * 500;
          } else if (qrsPhase < 0.6) {
            y = centerY + 30 - (qrsPhase - 0.4) * 150;
          } else {
            y = centerY - 20 * (1 - qrsPhase);
          }
        } else if (beatPhase < 0.5) {
          // ST segment
          y = centerY;
        } else if (beatPhase < 0.7) {
          // T wave
          const tPhase = (beatPhase - 0.5) / 0.2;
          y = centerY - 15 * Math.sin(tPhase * Math.PI);
        } else {
          // Rest
          y = centerY;
        }
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      offset += speed;
      animationId = requestAnimationFrame(drawECG);
    };
    
    drawECG();
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [heartRate, color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={200} 
      className="w-full h-[200px] bg-black/90 rounded-lg"
    />
  );
}