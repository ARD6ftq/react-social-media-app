'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../app/globals.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage (in a real app, use proper auth state management)
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to homepage
        router.push('/Home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-80 rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden'>
        <div className='flex flex-col justify-center items-center space-y-2'>
          <h2 className='text-2xl font-medium text-slate-700'>Login</h2>
          <p className='text-slate-500'>Enter details below.</p>
        </div>
        {error && (
          <div className='mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        <form className='w-full mt-4 space-y-3' onSubmit={handleSubmit}>
          <div>
            <input
              className='outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300'
              placeholder='Username'
              id='username'
              name='username'
              type='text'
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              className='outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300'
              placeholder='Password'
              id='password'
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                className='mr-2 w-4 h-4'
                id='remember'
                name='remember'
                type='checkbox'
              />
              <span className='text-slate-500'>Remember me</span>
            </div>
            <a className='text-blue-500 font-medium hover:underline' href='#'>
              Forgot Password
            </a>
          </div>
          <button
            className='w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2 disabled:opacity-50 disabled:cursor-not-allowed'
            id='login'
            name='login'
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <p className='flex justify-center space-x-1'>
            <span className='text-slate-700'>Don't have an account?</span>
            <Link className='text-blue-500 hover:underline' href='/SignUp'>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
