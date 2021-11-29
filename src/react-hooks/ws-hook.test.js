import React from 'react'
import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react-hooks/dom'
import WS from 'jest-websocket-mock'

import { useWebsocket, WebsocketProvider } from '../index'

describe('useWebsocket', () => {
  let server, ws

  beforeEach(async () => {
    server = new WS('wss://localhost')
    const wrapper = ({ children }) => (
      <WebsocketProvider url={'wss://localhost/'}>{children}</WebsocketProvider>
    )
    const { result } = renderHook(() => useWebsocket(), { wrapper })
    await server.connected
    ws = result.current
  }, 30000)
  afterEach(() => {
    WS.clean()
  })
  it('Открыли ws, подписались - отправили команду на подписание', async () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', handleReceivedMessage)

    await expect(server).toReceiveMessage(
      '{"command":"subscribe","identifier":"123"}'
    )
  })
  it('Открыли ws, отписались -> отправили команду на unsubscribe', async () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', handleReceivedMessage)
    await expect(server).toReceiveMessage(
      '{"command":"subscribe","identifier":"123"}'
    )

    ws.unsubscribe('123', handleReceivedMessage)
    await expect(server).toReceiveMessage(
      '{"command":"unsubscribe","identifier":"123"}'
    )
  })
  it('Открыли ws, пришел ответ от сервера -> вызван переданный callback', async () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: '',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    await server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
  })
  it('Открыли ws, пришел ответ от сервера без event -> вызван переданный callback', async () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe(
      '{\\"channel\\":\\"RequestsChannel\\",\\"request_id\\":\\"627cd11a-6cc5-4ff6-b206-df529d7d610f\\"}',
      handleReceivedMessage
    )

    const eventMessage = {
      identifier:
        '{\\"channel\\":\\"RequestsChannel\\",\\"request_id\\":\\"627cd11a-6cc5-4ff6-b206-df529d7d610f\\"}',
      message: {
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    await server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
  })
  it('Открыли ws, дважды подписались на канал, пришел ответ от сервера -> один раз вызван переданный callback', () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', handleReceivedMessage)
    ws.subscribe('123', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: '',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
  })
  it('Открыли ws, дважды подписались на канал, пришел ответ от сервера, один раз отписались -> не вызван переданный callback', () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', handleReceivedMessage)
    ws.subscribe('123', handleReceivedMessage)

    ws.unsubscribe('123', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: '',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(0)
  })
  it('Открыли ws, подписались на канал, пришел ответ от сервера c типом -> вызван переданный callback', () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: 'something',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
  })
  it('Открыли ws, подписались на канал с типом, пришел ответ от сервера без типа -> не вызван переданный callback', () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', 'something', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: '',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(0)
  })
  it('Открыли ws, подписались на канал с типом, пришел ответ от сервера c типом -> вызван переданный callback', () => {
    const handleReceivedMessage = jest.fn()
    ws.subscribe('123', 'something', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: 'something',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
  })
  it('Открыли ws, подписались на канал разными callback, пришел ответ от сервера -> вызван переданные callback', () => {
    const handleReceivedMessage = jest.fn()
    const handleReceivedMessage2 = jest.fn()
    ws.subscribe('123', handleReceivedMessage)
    ws.subscribe('123', handleReceivedMessage2)

    const eventMessage = {
      identifier: '123',
      message: {
        event: '',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
    expect(handleReceivedMessage2).toBeCalledTimes(1)
  })
  it('Открыли ws, подписались на канал c типами разными callback, пришел ответ от сервера c одним типом -> вызван переданный callback', () => {
    const handleReceivedMessage = jest.fn()
    const handleReceivedMessage2 = jest.fn()
    ws.subscribe('123', 'something1', handleReceivedMessage)
    ws.subscribe('123', 'something2', handleReceivedMessage2)

    const eventMessage = {
      identifier: '123',
      message: {
        event: 'something1',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
    expect(handleReceivedMessage2).toBeCalledTimes(0)
  })
  it('Открыли ws, подписались на канал c типами разными callback, пришел ответ от сервера c одним типом -> вызван переданные callback', () => {
    const handleReceivedMessage = jest.fn()
    const handleReceivedMessage2 = jest.fn()
    ws.subscribe('123', 'something1', handleReceivedMessage)
    ws.subscribe('123', handleReceivedMessage2)

    const eventMessage = {
      identifier: '123',
      message: {
        event: 'something1',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
    expect(handleReceivedMessage2).toBeCalledTimes(1)
  })
  it('Открыли ws, подписались на канал c типами разными callback, удалили подписание на весь канал, пришел ответ от сервера c одним типом -> вызван callback по типу', () => {
    const handleReceivedMessage = jest.fn()
    const handleReceivedMessage2 = jest.fn()
    ws.subscribe('123', 'something1', handleReceivedMessage)
    ws.subscribe('123', handleReceivedMessage2)
    ws.unsubscribe('123', handleReceivedMessage2)

    const eventMessage = {
      identifier: '123',
      message: {
        event: 'something1',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(1)
    expect(handleReceivedMessage2).toBeCalledTimes(0)
  })
  it('Открыли ws, подписались на канал c типами разными callback, удалили подписание по типу, пришел ответ от сервера c одним типом -> вызван callback по каналу', () => {
    const handleReceivedMessage = jest.fn()
    const handleReceivedMessage2 = jest.fn()
    ws.subscribe('123', 'something1', handleReceivedMessage)
    ws.subscribe('123', handleReceivedMessage2)
    ws.unsubscribe('123', 'something1', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: 'something1',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(0)
    expect(handleReceivedMessage2).toBeCalledTimes(1)
  })
  it('Открыли ws, подписались на канал с типом, без типа, отписались от всего канала -> вызван callback по типу', () => {
    const handleReceivedMessage = jest.fn()
    const handleReceivedMessage2 = jest.fn()
    ws.subscribe('123', handleReceivedMessage)
    ws.subscribe('123', 'something1', handleReceivedMessage2)
    ws.unsubscribe('123', handleReceivedMessage)

    const eventMessage = {
      identifier: '123',
      message: {
        event: 'something1',
        payload: {},
      },
    }
    const serverSend = JSON.stringify(eventMessage)
    server.send(serverSend)
    expect(handleReceivedMessage).toBeCalledTimes(0)
    expect(handleReceivedMessage2).toBeCalledTimes(1)
  })
})
