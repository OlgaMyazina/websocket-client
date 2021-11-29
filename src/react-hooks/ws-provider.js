import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { closeWS, createWS } from '../helpers/ws-helpers'
import PropTypes from 'prop-types'

// Constants
import { TIME_FOR_PING_WS } from '../constants/constants'

const WebsocketContext = createContext()

export const WebsocketProvider = ({ children, url }) => {
  const [ws, setWS] = useState(null)
  const timeout = useRef(null)

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current)
      if (ws) {
        closeWS(ws)
      }
    }
  }, [])

  useEffect(() => {
    clearTimeout(timeout.current)

    const isUrlChanged = ws?.url !== url
    if (!ws || isUrlChanged) {
      connect(url)
    }
  }, [url, ws])

  // Methods
  function connect(url) {
    if (ws) {
      closeWS(ws)
    }
    const createdWS = createWS(url, () => {
      closeWS(createdWS)
      // нужно вызвать connect через useEffect
      timeout.current = setTimeout(() => {
        setWS(null)
      }, TIME_FOR_PING_WS)
    })
    setWS(createdWS)
  }

  const value = { ws }

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  )
}
WebsocketProvider.propTypes = {
  children: PropTypes.any,
  url: PropTypes.string.isRequired,
}
WebsocketProvider.defaultProps = {
  children: null,
}

export function useWebsocketContext() {
  const context = useContext(WebsocketContext)
  if (context === undefined) {
    throw new Error('useWebsocket must be used within a WebsocketProvider')
  }
  return context
}
