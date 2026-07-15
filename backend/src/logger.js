const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const currentLevel = process.env.LOG_LEVEL?.toLowerCase() || 'debug'
const minLevel = LEVELS[currentLevel] ?? LEVELS.debug

function serialize(value) {
  if (value instanceof Error) {
    return `${value.message}${value.stack ? `\n${value.stack}` : ''}`
  }
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function log(level, ...items) {
  if (LEVELS[level] < minLevel) return
  const timestamp = new Date().toISOString()
  const message = items.map(serialize).join(' ')
  console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`)
}

export const logger = {
  debug: (...items) => log('debug', ...items),
  info: (...items) => log('info', ...items),
  warn: (...items) => log('warn', ...items),
  error: (...items) => log('error', ...items),
}
