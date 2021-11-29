import { useEffect, useRef } from 'react'
import {
  getSubscribeArgs,
  getSubscribeMessage,
  getUnsubscribeMessage,
} from '../helpers/helpers'
import { useWebsocketContext } from './ws-provider'

// Constants
import { NO_EVENT_SYMBOL, READY_STATE } from '../constants/constants'

export function useWebsocket() {
  const { ws } = useWebsocketContext()

  const subscriptions = useRef({})

  useEffect(() => {
    ws?.addEventListener('message', handleMessage)
    return () => {
      ws?.removeEventListener('message', handleMessage)
    }
  }, [ws])

  // Methods
  function addSubscription(
    channelId,
    event = NO_EVENT_SYMBOL,
    onReceiveMessage
  ) {
    if (ws.readyState !== READY_STATE.OPEN) {
      console.error('ws is not open')
      return
    }
    const channelSubscriptions = subscriptions.current[channelId] || {}
    const eventSubscriptions = channelSubscriptions[event] || []
    const findEventReceiveMessage = eventSubscriptions.find(
      (elem) => elem === onReceiveMessage
    )
    if (!findEventReceiveMessage) {
      eventSubscriptions.push(onReceiveMessage)
      channelSubscriptions[event] = eventSubscriptions
    }

    subscriptions.current[channelId] = channelSubscriptions

    ws.send(getSubscribeMessage(channelId))
  }
  function removeSubscription(
    channelId,
    event = NO_EVENT_SYMBOL,
    onReceiveMessage
  ) {
    if (ws.readyState !== READY_STATE.OPEN) {
      console.error('ws is not open')
      return
    }
    const channelSubscriptions = subscriptions.current[channelId] || {}
    const eventSubscriptions = channelSubscriptions[event] || []
    channelSubscriptions[event] = eventSubscriptions.filter(
      (s) => s !== onReceiveMessage
    )

    subscriptions.current[channelId] = channelSubscriptions

    ws.send(getUnsubscribeMessage(channelId))
  }

  // Handlers
  function handleMessage(event) {
    const { identifier, message } = JSON.parse(event.data)

    if (!identifier) {
      return
    }
    const channelSubscriptions = subscriptions.current[identifier] || {}
    const subscribers = [
      ...(channelSubscriptions[message?.event] || []),
      ...(channelSubscriptions[NO_EVENT_SYMBOL] || []),
    ]

    subscribers.forEach((s) => s(event))
  }

  return {
    subscribe: (...args) => {
      const { channelId, event, onReceiveMessage } = getSubscribeArgs(...args)
      addSubscription(channelId, event, onReceiveMessage)
    },
    unsubscribe: (...args) => {
      const { channelId, event, onReceiveMessage } = getSubscribeArgs(...args)
      removeSubscription(channelId, event, onReceiveMessage)
    },
  }
}
