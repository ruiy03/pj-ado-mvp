type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  level: LogLevel;
  enableInProduction: boolean;
}

const config: LogConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableInProduction: false
};

function shouldLog(level: LogLevel): boolean {
  if (process.env.NODE_ENV === 'production' && !config.enableInProduction) {
    return level === 'error' || level === 'warn';
  }
  
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(config.level);
  const requestedLevelIndex = levels.indexOf(level);
  
  return requestedLevelIndex >= currentLevelIndex;
}

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, data ? data : '');
    }
  },
  
  info: (message: string, data?: unknown) => {
    if (shouldLog('info')) {
      console.log(`[INFO] ${message}`, data ? data : '');
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data ? data : '');
    }
  },
  
  error: (message: string, error?: unknown) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error ? error : '');
    }
  }
};