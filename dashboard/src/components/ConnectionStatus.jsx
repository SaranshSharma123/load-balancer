import { Wifi, WifiOff } from 'lucide-react';

function ConnectionStatus({ connected }) {
    return (
        <div
            className={`
        fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl
        text-xs font-medium transition-all duration-500
        ${connected
                    ? 'bg-healthy/10 text-healthy border border-healthy/20 opacity-70 hover:opacity-100'
                    : 'bg-unhealthy/10 text-unhealthy border border-unhealthy/30 animate-pulse'
                }
      `}
        >
            {connected ? (
                <>
                    <Wifi className="w-3.5 h-3.5" />
                    Connected
                </>
            ) : (
                <>
                    <WifiOff className="w-3.5 h-3.5" />
                    Reconnecting...
                </>
            )}
        </div>
    );
}

export default ConnectionStatus;
