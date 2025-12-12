/**
 * Production-ready logger utility
 * Solo muestra logs en desarrollo, silencioso en producción
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Niveles de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Nivel actual (puedes configurar via env var)
const CURRENT_LEVEL = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * Logger para producción
 */
export const logger = {
  error: (...args) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.ERROR) {
      console.error('❌', ...args);
    }
  },
  
  warn: (...args) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.WARN) {
      console.warn('⚠️', ...args);
    }
  },
  
  info: (...args) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      console.info('ℹ️', ...args);
    }
  },
  
  debug: (...args) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
      console.log('🐛', ...args);
    }
  },
  
  // Métodos específicos para Dashboard
  dashboard: {
    load: (message) => {
      if (isDevelopment) console.log('🔄', message);
    },
    success: (message) => {
      if (isDevelopment) console.log('✅', message);
    },
    cache: (message) => {
      if (isDevelopment) console.log('💾', message);
    },
    skip: (message) => {
      if (isDevelopment) console.log('⏭️', message);
    },
  },
  
  // Suprimir logs de desarrollo en producción
  suppress: () => {
    if (isProduction) {
      // Suprimir console.log y console.debug en producción
      console.log = () => {};
      console.debug = () => {};
    }
  },
};

// Auto-suprimir en producción
logger.suppress();

export default logger;
