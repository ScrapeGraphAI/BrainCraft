type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ConsoleStyles {
  debug: string[];
  info: string[];
  warn: string[];
  error: string[];
}

class Logger {
  private context: string;
  private isDevelopment: boolean;
  private styles: ConsoleStyles = {
    debug: ['color: #6c757d'],
    info: ['color: #28a745'],
    warn: ['color: #ffc107'],
    error: ['color: #dc3545', 'font-weight: bold'],
  };

  constructor(context: string) {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string): [string, string[]] {
    const timestamp = new Date().toISOString();
    const formattedMessage = `%c[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    return [formattedMessage, this.styles[level]];
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    const [formattedMessage, styles] = this.formatMessage(level, message);
    
    // Always log errors
    if (level === 'error') {
      console.group(`%c🔴 Error in ${this.context}`, 'color: #dc3545; font-weight: bold;');
      console.error(formattedMessage, ...styles, ...args);
      console.groupEnd();
      return;
    }

    // Only log other levels in development
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: '💡',
        warn: '⚠️',
      }[level];

      switch (level) {
        case 'debug':
          console.debug(`${emoji} ${formattedMessage}`, ...styles, ...args);
          break;
        case 'info':
          console.info(`${emoji} ${formattedMessage}`, ...styles, ...args);
          break;
        case 'warn':
          console.warn(`${emoji} ${formattedMessage}`, ...styles, ...args);
          break;
      }
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, error?: Error, ...args: any[]) {
    if (error) {
      this.log('error', message, '\nError:', error.stack || error.message, ...args);
    } else {
      this.log('error', message, ...args);
    }
  }

  group(label: string) {
    if (this.isDevelopment) {
      console.group(`%c📦 ${label}`, 'color: #0066cc; font-weight: bold;');
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

export const createLogger = (context: string) => new Logger(context);
