type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private isProd = import.meta.env.PROD;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...metadata
    };

    if (this.isProd) {
      // In production, we only log warnings and errors
      if (level === 'warn' || level === 'error') {
        console[level](JSON.stringify(logData));
      }
    } else {
      // In development, we log everything with better formatting
      const color = {
        debug: '\x1b[34m', // blue
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m'  // red
      }[level];
      
      console[level](
        `${color}[${level.toUpperCase()}]\x1b[0m`,
        message,
        metadata ? JSON.stringify(metadata, null, 2) : ''
      );
    }
  }

  debug(message: string, metadata?: LogMetadata) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: LogMetadata) {
    this.log('error', message, {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
}

export const logger = Logger.getInstance();
