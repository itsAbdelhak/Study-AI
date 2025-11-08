
import React, { useState } from 'react';
import { AuthForm } from './AuthForm';

export const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2 text-gray-800 tracking-tight">
                        {isLoginView ? 'Welcome Back 👋' : 'Let’s Get Started 🚀'}
                    </h1>
                    <p className="text-gray-500">
                        {isLoginView ? 'Sign in to continue to your study dashboard.' : 'Create an account to start your personalized learning journey.'}
                    </p>
                </div>
                
                <div className="mt-8">
                    <AuthForm type={isLoginView ? 'login' : 'signup'} />
                </div>
                
                <div className="mt-6 text-center text-sm">
                    <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-blue-500 hover:text-blue-600">
                        {isLoginView ? 'Don’t have an account? Sign up' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};