export function getSubscribeArgs(channelId, ...other) {
  const event = typeof other[0] === 'function' ? undefined : other[0]
  const onReceiveMessage =
    typeof other[0] === 'function' ? other[0] : other[1] || (() => {})
  return { channelId, event, onReceiveMessage }
}

export function getSubscribeMessage(identifier) {
  return JSON.stringify({
    command: 'subscribe',
    identifier,
  })
}

export function getUnsubscribeMessage(identifier) {
  return JSON.stringify({
    command: 'unsubscribe',
    identifier,
  })
}
