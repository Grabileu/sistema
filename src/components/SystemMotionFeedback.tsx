import React from 'react'
import { Gauge, WifiOff } from 'lucide-react'

interface SystemMotionFeedbackProps {
  showRoutePulse: boolean
  connectionState: 'normal' | 'unstable' | 'offline'
}

const SystemMotionFeedback: React.FC<SystemMotionFeedbackProps> = ({
  showRoutePulse,
  connectionState,
}) => {
  return (
    <>
      {showRoutePulse && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] px-6 pt-3">
          <div className="system-pulse-shell">
            <div className="system-pulse-bar" />
          </div>
        </div>
      )}

      {connectionState !== 'normal' && (
        <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center">
          <div className="system-connection-pill">
            <div className={`system-connection-dot ${connectionState === 'offline' ? 'system-connection-dot-offline' : ''}`} />
            {connectionState === 'offline' ? <WifiOff size={16} /> : <Gauge size={16} />}
            <span>
              {connectionState === 'offline' ? 'Sem conexao' : 'Conexao instavel'}
            </span>
          </div>
        </div>
      )}
    </>
  )
}

export default SystemMotionFeedback
