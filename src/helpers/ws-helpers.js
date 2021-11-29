let errorCallbackFn = () => {}

function createWS(url, errorCallback) {
  const ws = new WebSocket(url)
  errorCallbackFn = errorCallback || errorCallbackFn
  addEventListeners(ws)
  return ws
}

function addEventListeners(ws) {
  ws.addEventListener('open', handleOpen)
  ws.addEventListener('message', handleMessage)
  ws.addEventListener('error', handleError)
  ws.addEventListener('close', handleClose)
}

function closeWS(ws) {
  ws.removeEventListener('open', handleOpen)
  ws.removeEventListener('message', handleMessage)
  ws.removeEventListener('error', handleError)
  ws.removeEventListener('close', handleClose)
  ws.close()
}

function handleOpen() {
  console.log('Connection is opened.')
}

function handleMessage(msg) {
  console.log('Message is received', { msg })
}

function handleError(error) {
  console.log('An error is occured', { error })
  errorCallbackFn(error)
}

function handleClose() {
  console.log('Connection is closed.')
}

export { createWS, closeWS }
