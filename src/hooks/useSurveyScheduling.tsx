"use client";
import { useState, useEffect } from 'react';

export interface SurveySchedulingSettings {
  enabled: boolean;
  title?: string;
  description?: string;
  scheduling?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
    autoEnable?: boolean;
    autoDisable?: boolean;
  };
  display?: {
    showCountdown?: boolean;
    showParticipantCount?: boolean;
    showProgress?: boolean;
    customMessage?: string;
    thankYouMessage?: string;
  };
}

export interface SurveyStatus {
  active: boolean;
  reason: 'active' | 'disabled' | 'not_started' | 'ended';
  startDate?: Date;
  endDate?: Date;
}

export function useSurveyScheduling(settings: SurveySchedulingSettings | null): SurveyStatus {
  const [status, setStatus] = useState<SurveyStatus>({ active: false, reason: 'disabled' });

  useEffect(() => {
    if (!settings) {
      setStatus({ active: false, reason: 'disabled' });
      return;
    }

    const checkStatus = () => {
      if (!settings.enabled) {
        setStatus({ active: false, reason: 'disabled' });
        return;
      }

      // Get current time in Pakistani timezone
      const now = new Date();
      const pakistaniTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
      
      // Stored dates are already in the correct format (local Pakistani time)
      const startDate = settings.scheduling?.startDate ? new Date(settings.scheduling.startDate) : null;
      const endDate = settings.scheduling?.endDate ? new Date(settings.scheduling.endDate) : null;
      
      // If no scheduling restrictions, survey is active
      if (!startDate && !endDate) {
        setStatus({ active: true, reason: 'active' });
        return;
      }
      
      if (startDate && pakistaniTime < startDate) {
        setStatus({ active: false, reason: 'not_started', startDate });
        return;
      }
      
      if (endDate && pakistaniTime > endDate) {
        setStatus({ active: false, reason: 'ended', endDate });
        return;
      }
      
      setStatus({ active: true, reason: 'active', endDate });
    };

    checkStatus();
    
    // Check status every 5 seconds for more precision
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, [settings]);

  return status;
}

export function getStatusMessage(status: SurveyStatus) {
  switch (status.reason) {
    case 'disabled':
      return {
        emoji: '😔',
        title: 'Survey Currently Disabled',
        description: 'The survey is currently disabled by the administrator. Please check back later.'
      };
    case 'not_started':
      return {
        emoji: '⏰',
        title: 'Survey Not Yet Started',
        description: `This survey will be available starting ${status.startDate?.toLocaleString('en-US', {
          timeZone: 'Asia/Karachi',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })} (${status.startDate?.toLocaleString('en-US', {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}) PKT.`
      };
    case 'ended':
      return {
        emoji: '📝',
        title: 'Survey Has Ended',
        description: `This survey ended on ${status.endDate?.toLocaleString('en-US', {
          timeZone: 'Asia/Karachi',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })} (${status.endDate?.toLocaleString('en-US', {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}) PKT. Thank you for your interest!`
      };
    default:
      return {
        emoji: '😔',
        title: 'Survey Unavailable',
        description: 'The survey is currently not available.'
      };
  }
}
