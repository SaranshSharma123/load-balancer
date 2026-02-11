import { Activity, Zap } from 'lucide-react';

function Header() {
    return (
        <header className="relative overflow-hidden mb-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-700/20 via-dark-800/50 to-dark-900/80" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptLTItMjZIMjZ2MmgxMnptMCAyMHYtMkgyNnYyaDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent-500 rounded-2xl blur-xl opacity-30 animate-pulse-slow" />
                            <div className="relative bg-gradient-to-br from-accent-500 to-accent-700 p-3 rounded-2xl shadow-lg">
                                <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Load Balancer
                            </h1>
                            <p className="text-dark-200 text-sm mt-0.5">
                                Layer 7 Proxy — Real-Time Monitoring Dashboard
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 glass-card px-4 py-2">
                        <Activity className="w-4 h-4 text-healthy animate-pulse" />
                        <span className="text-sm text-dark-100 font-medium">Live</span>
                    </div>
                </div>
            </div>

            {/* Bottom border glow */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />
        </header>
    );
}

export default Header;
