import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import AlgorithmSelector from './components/AlgorithmSelector.jsx';
import ServerGrid from './components/ServerGrid.jsx';
import ConnectionStatus from './components/ConnectionStatus.jsx';

const SOCKET_URL = import.meta.env.PROD
    ? window.location.origin
    : 'http://localhost:3001';

function App() {
    const [state, setState] = useState({
        algorithm: 'round-robin',
        backends: [],
    });
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        s.on('connect', () => {
            setConnected(true);
        });

        s.on('disconnect', () => {
            setConnected(false);
        });

        s.on('lb:state', (data) => {
            setState(data);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    const handleToggleBackend = useCallback(async (id, enabled) => {
        try {
            const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:3001';
            await fetch(`${baseUrl}/api/backends/${id}/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled }),
            });
        } catch (err) {
            console.error('Failed to toggle backend:', err);
        }
    }, []);

    const handleSetAlgorithm = useCallback(async (algorithm) => {
        try {
            const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:3001';
            await fetch(`${baseUrl}/api/algorithm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ algorithm }),
            });
        } catch (err) {
            console.error('Failed to set algorithm:', err);
        }
    }, []);

    return (
        <div className="min-h-screen pb-12">
            <ConnectionStatus connected={connected} />
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <StatsBar backends={state.backends} />

                <AlgorithmSelector
                    current={state.algorithm}
                    onSelect={handleSetAlgorithm}
                />

                <ServerGrid
                    backends={state.backends}
                    onToggle={handleToggleBackend}
                />
            </main>
        </div>
    );
}

export default App;
