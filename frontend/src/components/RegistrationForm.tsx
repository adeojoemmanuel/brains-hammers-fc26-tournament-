import React, { useState } from 'react';
import leaguesData from '../data/leagues.json';
import { Link } from 'react-router-dom';

const leagues = Object.keys(leaguesData);

const RegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        league: '',
        club: '',
    });
    const [clubs, setClubs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [registrationCode, setRegistrationCode] = useState<string>('');

    const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLeague = e.target.value;
        setFormData({ ...formData, league: selectedLeague, club: '' });
        if (selectedLeague) {
            setClubs((leaguesData as any)[selectedLeague] || []);
        } else {
            setClubs([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Registration failed');
            }

            const data = await response.json();
            setRegistrationCode(data.player.code);
            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message);
        }
    };

    if (status === 'success') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 text-center border border-white/20 animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Registration Successful! 🎉</h2>
                    <p className="text-white/80 text-lg mb-2">
                        Thank you for registering, <span className="font-semibold text-white">{formData.firstName} {formData.lastName}</span>!
                    </p>
                    <p className="text-white/70 mb-6">
                        A confirmation email has been sent to <span className="font-semibold text-white">{formData.email}</span>
                    </p>
                    
                    {/* Registration Code Display */}
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 mb-6 border border-yellow-500/30">
                        <p className="text-white/90 text-sm font-semibold mb-3 uppercase tracking-wide">Your Unique Registration Code</p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border-2 border-dashed border-yellow-500/50">
                            <p className="text-4xl font-bold text-yellow-300 font-mono tracking-widest">
                                {registrationCode.toUpperCase()}
                            </p>
                        </div>
                        <p className="text-white/60 text-xs mt-3">Please save this code for your records. It has also been sent to your email.</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 mb-8 border border-white/10">
                        <p className="text-white font-semibold text-lg">
                            ⚽ B&H FC26 Championship begins on <span className="text-yellow-300">December 18th, 2025</span>
                        </p>
                    </div>
                    <Link
                        to="/table"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70"
                    >
                        View Players Table
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-white/20">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2">Player Registration</h2>
                    <p className="text-white/70">Join the B&H FC26 Championship</p>
                </div>

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 animate-shake">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-white/90 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-white/90 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-white/90 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="john.doe@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-white/90 mb-2">
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                            placeholder="123 Main Street, City, Country"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-white/90 mb-2">
                                League
                            </label>
                            <select
                                name="league"
                                required
                                value={formData.league}
                                onChange={handleLeagueChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-800">Select a League</option>
                                {leagues.map(l => (
                                    <option key={l} value={l} className="bg-slate-800">{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-white/90 mb-2">
                                Club
                            </label>
                            <select
                                name="club"
                                required
                                disabled={!formData.league}
                                value={formData.club}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none ${
                                    !formData.league ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                <option value="" className="bg-slate-800">
                                    {formData.league ? 'Select a Club' : 'Select League First'}
                                </option>
                                {clubs.map(c => (
                                    <option key={c} value={c} className="bg-slate-800">{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transform hover:-translate-y-0.5"
                    >
                        {status === 'submitting' ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : (
                            'Register Now'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
