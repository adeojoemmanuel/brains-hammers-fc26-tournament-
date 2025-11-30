import React, { useEffect, useState } from 'react';

interface Player {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    league: string;
    club: string;
    code?: string;
    createdAt: string;
}

const PlayerTable: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/players?page=${page}&limit=${limit}`);
            const data = await response.json();
            setPlayers(data.players);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, [page, limit]);

    // Filter players based on search query
    const filteredPlayers = players.filter((player) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        
        const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
        const email = player.email.toLowerCase();
        const address = player.address.toLowerCase();
        
        return fullName.includes(query) || email.includes(query) || address.includes(query);
    });

    return (
        <div className="max-w-7xl mx-auto w-full overflow-hidden">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Registered Players</h2>
                        <p className="text-white/70">View all tournament participants</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-white/90">Rows:</label>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm cursor-pointer"
                            >
                                <option value={10} className="bg-slate-800">10</option>
                                <option value={25} className="bg-slate-800">25</option>
                                <option value={50} className="bg-slate-800">50</option>
                                <option value={100} className="bg-slate-800">100</option>
                            </select>
                        </div>
                        <button
                            onClick={fetchPlayers}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm hover:scale-105"
                        >
                            <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or address..."
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="w-5 h-5 text-white/50 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    </div>
                ) : players.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-white/70 text-lg">No players registered yet</p>
                        <p className="text-white/50 mt-2">Be the first to register!</p>
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-white/70 text-lg">No players found</p>
                        <p className="text-white/50 mt-2">Try adjusting your search query</p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="rounded-lg border border-white/10 overflow-hidden">
                            <table className="w-full table-fixed divide-y divide-white/10">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="w-[18%] px-3 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                                Player
                                            </th>
                                            <th className="w-[18%] px-3 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider hidden md:table-cell">
                                                Email
                                            </th>
                                            <th className="w-[14%] px-3 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider hidden lg:table-cell">
                                                Address
                                            </th>
                                            <th className="w-[11%] px-3 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                                League
                                            </th>
                                            <th className="w-[13%] px-3 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                                Club
                                            </th>
                                            <th className="w-[11%] px-3 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                                Code
                                            </th>
                                            <th className="w-[9%] px-3 py-4 text-left text-xs font-semibold text-white/90 uppercase tracking-wider hidden xl:table-cell">
                                                Registered
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/5 divide-y divide-white/10">
                                        {filteredPlayers.map((player, index) => (
                                            <tr
                                                key={player.id}
                                                className="hover:bg-white/10 transition-colors duration-150"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="px-3 py-4">
                                                    <div className="flex items-center min-w-0">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                                            <span className="text-white font-semibold text-sm">
                                                                {player.firstName[0]}{player.lastName[0]}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-medium text-white truncate">
                                                                {player.firstName} {player.lastName}
                                                            </div>
                                                            <div className="text-xs text-white/60 md:hidden truncate">
                                                                {player.email}
                                                            </div>
                                                            <div className="text-xs text-purple-300/80 md:hidden mt-1">
                                                                {player.club}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 hidden md:table-cell">
                                                    <div className="text-sm text-white/90 truncate" title={player.email}>
                                                        {player.email}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 hidden lg:table-cell">
                                                    <div className="text-sm text-white/80 truncate" title={player.address}>
                                                        {player.address}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4">
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30 truncate max-w-full">
                                                        {player.league}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4">
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 truncate max-w-full">
                                                        {player.club}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4">
                                                    {player.code ? (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-200 border border-yellow-500/50 font-mono tracking-wider truncate max-w-full">
                                                            {player.code.toUpperCase()}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                                            N/A
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-4 hidden xl:table-cell">
                                                    <div className="text-sm text-white/70">
                                                        {new Date(player.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <div className="text-sm text-white/70">
                                Showing page <span className="font-semibold text-white">{page}</span> of{' '}
                                <span className="font-semibold text-white">{totalPages}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm hover:scale-105 disabled:hover:scale-100"
                                >
                                    <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm hover:scale-105 disabled:hover:scale-100"
                                >
                                    Next
                                    <svg className="w-5 h-5 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlayerTable;
