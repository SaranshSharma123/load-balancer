import ServerCard from './ServerCard.jsx';
import { Server } from 'lucide-react';

function ServerGrid({ backends, onToggle }) {
    if (backends.length === 0) {
        return (
            <div className="glass-card p-12 text-center animate-fade-in">
                <Server className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-200 mb-2">No Backends Configured</h3>
                <p className="text-dark-300 text-sm">
                    Waiting for backend configuration...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-accent-400" />
                Backend Servers
                <span className="text-xs font-normal text-dark-300 ml-2">
                    ({backends.length} configured)
                </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {backends.map((backend, index) => (
                    <ServerCard
                        key={backend.id}
                        backend={backend}
                        index={index}
                        onToggle={onToggle}
                    />
                ))}
            </div>
        </div>
    );
}

export default ServerGrid;
