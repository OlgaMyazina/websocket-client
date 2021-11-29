import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks/dom'
import WS from 'jest-websocket-mock'

import { WebsocketProvider, useWebsocketContext } from './ws-provider'

describe('WebsocketProvider, useWebsocketContext', () => {
  beforeEach(async () => {
    const server = new WS('wss://localhost/')
    console.info('websocket server is running', { server })
  })
  afterEach(() => {
    WS.clean()
  })
  it('useWebsocketContext without Provider -> error', () => {
    const { result } = renderHook(() => useWebsocketContext())
    expect(() => result.current).toThrow(
      'useWebsocket must be used within a WebsocketProvider'
    )
  })

  it('WebsocketProvider', async () => {
    const ExampleProvider = () => {
      const context = useWebsocketContext()
      expect(context.ws).toStrictEqual(expect.any(Object))
      return <></>
    }
    render(
      <WebsocketProvider url={'wss://localhost/'}>
        <ExampleProvider />
      </WebsocketProvider>
    )
  })
})
