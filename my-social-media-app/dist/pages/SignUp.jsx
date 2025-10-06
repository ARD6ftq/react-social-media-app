import React from 'react';
import Link from 'next/link';
const SignUp = () => {
    return (<div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>Sign Up</h2>
        <form className='flex flex-col'>
          <input placeholder='First Name' className='bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150' type='text' required/>
          <input placeholder='Last Name' className='bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150' type='text' required/>
          <input placeholder='Username' className='bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150' type='text' required/>
          <input placeholder='Email' className='bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150' type='email' required/>
          <input placeholder='Password' className='bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150' type='password' required/>
          <input placeholder='Confirm password' className='bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150' type='password' required/>
          <p className='text-gray-900 mt-4'>
            Already have an account?{' '}
            <Link className='text-sm text-blue-500 hover:underline' href='/'>
              Login
            </Link>
          </p>
          <button className='bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150' type='submit'>
            Sign Up
          </button>
        </form>
      </div>
    </div>);
};
export default SignUp;
