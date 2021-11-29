import WS from 'jest-websocket-mock'
import { createWS, closeWS } from './ws-helpers'
import { READY_STATE } from '../constants/constants'

describe('createWS', () => {
  let server

  beforeEach(async () => {
    server = new WS('wss://localhost')
  })
  afterEach(() => {
    WS.clean()
  })
  it('url, ws is connected -> ws ready state is OPEN ', async () => {
    const ws = createWS('wss://localhost')
    await server.connected
    expect(ws.readyState).toBe(READY_STATE.OPEN)
  })
  it('url, ws is error -> onErrorCallback', async () => {
    const handleOnError = jest.fn()
    createWS('wss://localhost', handleOnError)
    await server.connected
    server.error()
    expect(handleOnError).toBeCalledTimes(1)
    expect(handleOnError).toBeCalledWith(expect.any(Object))
  })
})

describe('closeWS', () => {
  let server, ws

  beforeEach(async () => {
    server = new WS('wss://localhost')
    ws = createWS('wss://localhost')
    await server.connected
  })
  afterEach(() => {
    WS.clean()
  })
  it('ws -> ws ready state is CLOSING', () => {
    closeWS(ws)
    expect(ws.readyState).toBe(READY_STATE.CLOSING)
  })
  it('ws -> ws ready state is CLOSED', async () => {
    jest.useFakeTimers()
    closeWS(ws)
    jest.advanceTimersByTime(5000)
    expect(ws.readyState).toBe(READY_STATE.CLOSED)
    jest.useRealTimers()
  })
})
