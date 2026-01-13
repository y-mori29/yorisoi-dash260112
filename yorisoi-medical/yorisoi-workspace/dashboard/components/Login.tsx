import React, { useState } from 'react';

interface Props {
    onLogin: () => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Authentication Logic
        // ID: demo, Pass: demo
        if (id === 'demo' && password === 'demo') {
            onLogin();
        } else {
            setError('IDまたはパスワードが間違っています');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mb-4">
                        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">よりそいPro</h2>
                    <p className="text-sm text-gray-500 mt-2">Home Visit Edition</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ユーザーID
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="demo"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="demo"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition-colors font-bold shadow-sm"
                    >
                        ログイン
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>デモ用アカウント: ID: demo / Pass: demo</p>
                </div>
            </div>
        </div>
    );
};
