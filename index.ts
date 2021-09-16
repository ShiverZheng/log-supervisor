import debug from 'debug'

export default class Logger {
  private static _instance: debug.Debugger | null = null

  /**
   * The logger instance
   */
  static get instance() {
    if (Logger._instance) {
      return Logger._instance
    }
    Logger._instance = debug(Logger.prefix)
    Logger._instance.log = console.log.bind(console)
    return Logger._instance
  }

  private static _namespace: string[] = []

  /**
   * Set namespace
   * @param {string} key
   */
  private static setNamespace(...keys: string[]) {
    for (const key of keys) {
      if (Logger._namespace.includes(key)) {
        throw new Error(`${key} is already exists.`)
      }
      Logger._namespace.push(key)
    }
  }

  /**
   * One namespace corresponds to one logger
   */
  static get namespace() {
    return Logger._namespace
  }

  private static _preifx: string

  /**
   *  @returns {string} String of prefix
   */
  static get prefix(): string {
    if (!Logger._preifx) {
      throw new Error('You should set prefix by Logger.prefix = <PREFIX> first.')
    }
    return Logger._preifx
  }

  /**
   * You should set a prefix for each project.
   */
  static set prefix(prefix: string) {
    Logger._preifx = prefix
  }

  /**
   * Register a new logger
   * @param {string} key
   * @returns {debug.Debugger}
   */
  static register(key: string): debug.Debugger {
    Logger.setNamespace(key)
    return Logger.instance.extend(key)
  }

  /**
   * Let logger start working
   * @param {string[]} keys Variadic, Enable specified loggers by keys, default all
   */
  static do(...keys: string[]) {
    if (sessionStorage.getItem('silence')) return
    let value = Logger.prefix + '*'
    if (keys && keys.length) {
      value = keys.map((k) => `${Logger.prefix}:${k}`).join(',')
    }
    localStorage.setItem('debug', value)
  }

  /**
   * Invalidate certain namespaces
   * @param {string[]} keys Variadic, Enable specified loggers by keys, default all
   */
  static omit(...keys: string[]) {
    for (const k of keys) {
      const index = Logger.namespace.findIndex(v => v === k)
      if (index > -1) {
        Logger.namespace.splice(index, 1)
      }
      localStorage.removeItem(k)
    }
    Logger._namespace = Logger.namespace
    Logger.do(...Logger.namespace)
  }

  /**
   * Silence logger
   */
  static silence() {
    const exist = localStorage.getItem('debug')
    if (exist) localStorage.removeItem('debug')
    sessionStorage.setItem('silence', 'true')
  }

  /**
   * Get namespace being printed
   * @returns {string[]}
   */
  static get whoIsWorking(): string[] {
    const value = localStorage.getItem('debug')
    if (value) {
      if (value === `${Logger.prefix}*`) {
        return Logger.namespace
      }
      return value.split(',').map(v => v.replace(`${Logger.prefix}:`, ''))
    }
    return []
  }

  /**
   * Disable debug
   */
  static disable() {
    debug.disable()
  }

  /**
   * Enable debug
   */
  static enable() {
    debug.enable(`${Logger.prefix}*`)
  }

  /**
   * Bind logger to window, then you can call it in your broswer console
   */
  static bindToWindow() {
    const logger = {
      do: (...keys: string[]) => {
        if (sessionStorage.getItem('silence')) {
          sessionStorage.removeItem('silence')
        }
        Logger.do(...keys)
      },
      omit: (...keys: string[]) => Logger.omit(...keys),
      silence: () => Logger.silence(),
      namespace: Logger.namespace,
      whoIsWorking: Logger.whoIsWorking,
    }
    ;(window as any)['logger'] = logger
  }
}