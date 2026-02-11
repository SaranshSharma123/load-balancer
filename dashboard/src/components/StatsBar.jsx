import { Server, Activity, AlertTriangle, BarChart3 } from 'lucide-react';

function StatsBar({ backends }) {
    const total = backends.length;
    const healthy = backends.filter((b) => b.status === 'healthy' && b.enabled).length;
    const unhealthy = backends.filter((b) => b.status === 'unhealthy').length;
    const totalRequests = backends.reduce((sum, b) => sum + (b.totalRequests || 0), 0);
    const totalErrors = backends.reduce((sum, b) => sum + (b.totalErrors || 0), 0);
    const avgResponseTime = backends.length > 0
        ? Math.round(backends.reduce((sum, b) => sum + (b.responseTimeMs || 0), 0) / backends.length)
        : 0;

    const stats = [
        {
            label: 'Total Backends',
            value: total,
            icon: Server,
            color: 'text-accent-400',
            bgColor: 'bg-accent-500/10',
            borderColor: 'border-accent-500/20',
        },
        {
            label: 'Healthy',
            value: healthy,
            icon: Activity,
            color: 'text-healthy',
            bgColor: 'bg-healthy/10',
            borderColor: 'border-healthy/20',
        },
        {
            label: 'Unhealthy',
            value: unhealthy,
            icon: AlertTriangle,
            color: 'text-unhealthy',
            bgColor: 'bg-unhealthy/10',
            borderColor: 'border-unhealthy/20',
        },
        {
            label: 'Total Requests',
            value: totalRequests.toLocaleString(),
            icon: BarChart3,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="glass-card-hover p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`${stat.bgColor} ${stat.borderColor} border p-2 rounded-xl`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                    </div>
                    <div className="stat-value mb-1">{stat.value}</div>
                    <div className="text-dark-200 text-xs font-medium uppercase tracking-wider">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default StatsBar;
