import {
    Globe,
    Activity,
    ArrowUpDown,
    Clock,
    AlertCircle,
    Power,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

function ServerCard({ backend, index, onToggle }) {
    const isHealthy = backend.status === 'healthy';
    const isEnabled = backend.enabled;
    const isActive = isHealthy && isEnabled;

    const statusLabel = !isEnabled
        ? 'Disabled'
        : isHealthy
            ? 'Healthy'
            : 'Unhealthy';

    const statusClass = !isEnabled
        ? 'status-disabled'
        : isHealthy
            ? 'status-healthy'
            : 'status-unhealthy';

    const lastCheckedAgo = backend.lastChecked
        ? getTimeAgo(new Date(backend.lastChecked))
        : 'Never';

    return (
        <div
            className={`
        glass-card-hover p-5 animate-slide-up relative overflow-hidden
      `}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Top accent bar */}
            <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${!isEnabled
                        ? 'bg-gray-500/40'
                        : isHealthy
                            ? 'bg-gradient-to-r from-healthy/60 via-healthy to-healthy/60'
                            : 'bg-gradient-to-r from-unhealthy/60 via-unhealthy to-unhealthy/60'
                    }`}
            />

            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`pulse-dot ${isActive ? 'healthy' : 'unhealthy'}`} />
                    <div>
                        <h3 className="font-semibold text-white text-base">{backend.id}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Globe className="w-3 h-3 text-dark-300" />
                            <span className="text-xs text-dark-300 font-mono">{backend.url}</span>
                        </div>
                    </div>
                </div>
                <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricItem
                    icon={ArrowUpDown}
                    label="Requests"
                    value={backend.totalRequests?.toLocaleString() || '0'}
                    color="text-blue-400"
                />
                <MetricItem
                    icon={Activity}
                    label="Active Conn."
                    value={backend.activeConnections || 0}
                    color="text-accent-400"
                />
                <MetricItem
                    icon={Clock}
                    label="Avg Response"
                    value={`${backend.responseTimeMs || 0}ms`}
                    color="text-amber-400"
                />
                <MetricItem
                    icon={AlertCircle}
                    label="Errors"
                    value={backend.totalErrors?.toLocaleString() || '0'}
                    color="text-red-400"
                />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-dark-600/40">
                <div className="text-xs text-dark-400">
                    Checked: <span className="text-dark-200">{lastCheckedAgo}</span>
                </div>

                <button
                    onClick={() => onToggle(backend.id, !isEnabled)}
                    className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
            transition-all duration-200
            ${isEnabled
                            ? 'bg-healthy/10 text-healthy hover:bg-healthy/20 border border-healthy/20'
                            : 'bg-dark-600/50 text-dark-300 hover:bg-dark-600/80 border border-dark-500/30'
                        }
          `}
                >
                    {isEnabled ? (
                        <>
                            <ToggleRight className="w-4 h-4" />
                            Enabled
                        </>
                    ) : (
                        <>
                            <ToggleLeft className="w-4 h-4" />
                            Disabled
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function MetricItem({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-dark-700/40 rounded-xl p-3 border border-dark-600/30">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-[10px] uppercase tracking-wider text-dark-300 font-medium">
                    {label}
                </span>
            </div>
            <div className="text-lg font-bold font-mono text-white">{value}</div>
        </div>
    );
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

export default ServerCard;
