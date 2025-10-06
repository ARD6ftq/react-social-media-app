'use client';
import React, { useState } from 'react';
import { CreatePostData } from '../types/post';

interface CreatePostProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  isSubmitting?: boolean;
}

const CreatePost: React.FC<CreatePostProps> = ({ onSubmit, isSubmitting = false }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const MAX_CHARACTERS = 500;
  const charactersLeft = MAX_CHARACTERS - content.length;
  const isOverLimit = charactersLeft < 0;
  const isNearLimit = charactersLeft <= 50 && charactersLeft >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write something before posting.');
      return;
    }

    if (content.length > MAX_CHARACTERS) {
      setError(`Post content cannot exceed ${MAX_CHARACTERS} characters.`);
      return;
    }

    try {
      await onSubmit({ content: content.trim() });
      setContent('');
    } catch (error) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">What's on your mind?</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Share your thoughts..."
            className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
              isOverLimit 
                ? 'border-red-500 focus:ring-red-500' 
                : isNearLimit 
                ? 'border-yellow-500 focus:ring-yellow-500'
                : 'border-gray-300'
            }`}
            rows={4}
            disabled={isSubmitting}
          />
          
          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              {isOverLimit ? (
                <span className="text-red-600 font-medium">
                  {Math.abs(charactersLeft)} characters over limit
                </span>
              ) : isNearLimit ? (
                <span className="text-yellow-600 font-medium">
                  {charactersLeft} characters remaining
                </span>
              ) : (
                <span className="text-gray-500">
                  {charactersLeft} characters remaining
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-red-500'
                    : isNearLimit
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(100, (content.length / MAX_CHARACTERS) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isOverLimit || isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !content.trim() || isOverLimit || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
