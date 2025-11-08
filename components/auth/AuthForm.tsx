
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { EyeIcon, EyeOffIcon } from '../icons';

interface AuthFormProps {
  type: 'login' | 'signup';
}

const InputField: React.FC<{
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  children?: React.ReactNode;
}> = ({ id, label, type, value, onChange, placeholder, required, children }) => (
  <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
      </label>
      <div className="mt-1 relative">
          <input
              id={id}
              name={id}
              type={type}
              autoComplete={id}
              required={required}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="block w-full appearance-none rounded-xl border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
          {children}
      </div>
  </div>
);

export const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (type === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage({ type: 'error', text: 'This user already exists. Please try logging in.' });
      } else if (data.user) {
        setMessage({ type: 'success', text: 'Success! Please check your email to confirm your account.' });
      }
    } else { // login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      }
      // No success message needed for login as onAuthStateChange will handle redirect
    }

    setLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'signup' && (
        <InputField
          id="full_name"
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Jane Doe"
          required
        />
      )}
      <InputField
        id="email"
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <InputField
        id="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      >
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
            {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
            ) : (
                <EyeIcon className="h-5 w-5" />
            )}
        </button>
      </InputField>
      
      {message && (
        <div className={`text-sm p-3 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-xl bg-blue-500 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            type === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>
      </div>
    </form>
  );
};