import Logger from './index'

test('It will throw error, because miss prefix', () => {
    expect(() => Logger.prefix).toThrowError()
})

test('It will return prefix', () => {
    Logger.prefix = 'jest'
    expect(Logger.prefix).toBe('jest')
})

test('It will return the defined instance of Logger', () => {
    Logger.prefix = 'jest'
    expect(Logger.instance).toBeDefined()
})

test('It will return setted namespace', () => {
    expect(Object.prototype.toString.call(Logger.register('j'))).toBe('[object Function]')
    expect(Logger.namespace).toContain('j')
})

test('It will set localstorge', () => {
    Logger.do()
    expect(localStorage.getItem('debug')).toBe('jest*')
})

test('It will remove the certain value of debug in localstorge', () => {
    Logger.omit('s', 't')
    expect(localStorage.getItem('s')).toBeUndefined()
    expect(localStorage.getItem('t')).toBeUndefined()
    expect(Logger.namespace).toStrictEqual(['j'])
})

test('It will remove the value of debug in localstorge', () => {
    Logger.silence()
    expect(localStorage.getItem('debug')).toBeUndefined()
})