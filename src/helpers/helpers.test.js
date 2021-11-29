import {
  getSubscribeArgs,
  getSubscribeMessage,
  getUnsubscribeMessage,
} from './helpers'

describe('getSubscribeArgs', () => {
  it('"123", fn -> ', () => {
    const handleSubscribe = jest.fn()
    const output = {
      channelId: '123',
      eventType: undefined,
      onReceiveMessage: handleSubscribe,
    }
    expect(getSubscribeArgs('123', handleSubscribe)).toEqual(output)
  })
  it('"123","request_update" , fn -> ', () => {
    const handleSubscribe = jest.fn()
    const output = {
      channelId: '123',
      event: 'request_update',
      onReceiveMessage: handleSubscribe,
    }
    expect(getSubscribeArgs('123', 'request_update', handleSubscribe)).toEqual(
      output
    )
  })
})

describe('getSubscribeMessage', () => {
  it('"123" -> subscribe identifier', () => {
    const output = '{"command":"subscribe","identifier":"123"}'
    expect(getSubscribeMessage('123')).toBe(output)
  })
  it('123 -> subscribe identifier', () => {
    const output = '{"command":"subscribe","identifier":123}'
    expect(getSubscribeMessage(123)).toBe(output)
  })
  it('channel -> subscribe channel', () => {
    const input = '{"channel":"RequestsChannel","request_id":"123"}'
    const output =
      '{"command":"subscribe","identifier":"{\\"channel\\":\\"RequestsChannel\\",\\"request_id\\":\\"123\\"}"}'
    expect(getSubscribeMessage(input)).toBe(output)
  })
})
describe('getUnsubscribeMessage', () => {
  it('"123" -> unsubscribe identifier', () => {
    const output = '{"command":"unsubscribe","identifier":"123"}'
    expect(getUnsubscribeMessage('123')).toBe(output)
  })
  it('123 -> unsubscribe identifier', () => {
    const output = '{"command":"unsubscribe","identifier":123}'
    expect(getUnsubscribeMessage(123)).toBe(output)
  })
  it('channel -> unsubscribe channel', () => {
    const input = '{"channel":"RequestsChannel","request_id":"123"}'
    const output =
      '{"command":"unsubscribe","identifier":"{\\"channel\\":\\"RequestsChannel\\",\\"request_id\\":\\"123\\"}"}'
    expect(getUnsubscribeMessage(input)).toBe(output)
  })
})
