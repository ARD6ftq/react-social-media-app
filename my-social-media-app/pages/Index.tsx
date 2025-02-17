'use client';
import React from 'react';
import Link from 'next/link';
import '../app/globals.css';

const SignIn = () => {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-80 rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden'>
        <div className='flex flex-col justify-center items-center space-y-2'>
          <h2 className='text-2xl font-medium text-slate-700'>Login</h2>
          <p className='text-slate-500'>Enter details below.</p>
        </div>
        <form className='w-full mt-4 space-y-3'>
          <div>
            <input
              className='outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300'
              placeholder='Username'
              id='username'
              name='username'
              type='text'
            />
          </div>
          <div>
            <input
              className='outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300'
              placeholder='Password'
              id='password'
              name='password'
              type='password'
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
            className='w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2'
            id='login'
            name='login'
            type='submit'
          >
            Login
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