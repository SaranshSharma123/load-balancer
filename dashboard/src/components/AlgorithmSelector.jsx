import { Shuffle, GitBranch } from 'lucide-react';

const algorithms = [
    {
        id: 'round-robin',
        name: 'Round Robin',
        description: 'Distributes requests evenly in circular order',
        icon: Shuffle,
    },
    {
        id: 'least-connections',
        name: 'Least Connections',
        description: 'Routes to the server with fewest active connections',
        icon: GitBranch,
    },
];

function AlgorithmSelector({ current, onSelect }) {
    return (
        <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-accent-400" />
                Load Balancing Algorithm
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {algorithms.map((algo) => {
                    const isActive = current === algo.id;
                    return (
                        <button
                            key={algo.id}
                            onClick={() => onSelect(algo.id)}
                            className={`
                relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left
                ${isActive
                                    ? 'bg-accent-500/10 border-accent-500/40 shadow-lg shadow-accent-500/5'
                                    : 'bg-dark-700/30 border-dark-600/40 hover:bg-dark-700/50 hover:border-dark-500/50'
                                }
              `}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute top-3 right-3">
                                    <div className="w-2.5 h-2.5 bg-accent-500 rounded-full animate-pulse" />
                                </div>
                            )}

                            <div className={`p-2.5 rounded-xl ${isActive ? 'bg-accent-500/20' : 'bg-dark-600/50'}`}>
                                <algo.icon className={`w-5 h-5 ${isActive ? 'text-accent-400' : 'text-dark-200'}`} />
                            </div>

                            <div>
                                <div className={`font-semibold text-sm ${isActive ? 'text-accent-300' : 'text-dark-100'}`}>
                                    {algo.name}
                                </div>
                                <div className="text-xs text-dark-300 mt-0.5">
                                    {algo.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default AlgorithmSelector;
