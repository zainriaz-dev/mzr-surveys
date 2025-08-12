"use client";
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  title?: string;
  type?: 'start' | 'end';
}

export default function CountdownTimer({ targetDate, onComplete, title, type = 'start' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Get current Pakistani time
      const now = new Date();
      const pakistaniTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
      
      const target = new Date(targetDate).getTime();
      const difference = target - pakistaniTime.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) {
          onComplete();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  const getTitle = () => {
    if (title) return title;
    return type === 'end' ? 'Survey Ends In' : 'Survey Starts In';
  };

  const getEmoji = () => {
    return type === 'end' ? '⚠️' : '⏰';
  };

  const getGradient = () => {
    return type === 'end' 
      ? 'from-red-600/20 to-orange-600/20' 
      : 'from-blue-600/20 to-purple-600/20';
  };

  return (
    <div className={`glass rounded-xl p-6 border border-white/10 bg-gradient-to-r ${getGradient()}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>{getEmoji()}</span> {getTitle()}
      </h3>
      
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-2xl font-bold text-blue-400">{timeLeft.days}</div>
          <div className="text-xs text-white/60 uppercase tracking-wide">Days</div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-2xl font-bold text-emerald-400">{timeLeft.hours}</div>
          <div className="text-xs text-white/60 uppercase tracking-wide">Hours</div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-2xl font-bold text-orange-400">{timeLeft.minutes}</div>
          <div className="text-xs text-white/60 uppercase tracking-wide">Minutes</div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-2xl font-bold text-red-400 animate-pulse">{timeLeft.seconds}</div>
          <div className="text-xs text-white/60 uppercase tracking-wide">Seconds</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-white/70">
          The survey will automatically become available when the countdown reaches zero.
        </p>
      </div>
    </div>
  );
}
