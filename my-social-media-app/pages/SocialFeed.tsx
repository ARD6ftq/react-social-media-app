'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post, Comment, CreatePostData, LikeResponse } from '../types/post';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import '../app/globals.css';

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch posts after user is set
      fetchPosts(parsedUser.id);
    } else {
      // Redirect to login if not authenticated
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const fetchPosts = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts?user_id=${userId}`);
      const postsData = await response.json();
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    }
  };

  const handleCreatePost = async (data: CreatePostData) => {
    setIsSubmittingPost(true);
    try {
      const response = await fetch('http://localhost:5001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          user_id: user.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Add new post to the beginning of the list
        setPosts(prevPosts => [result.post, ...prevPosts]);
      } else {
        throw new Error(result.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error; // Re-throw to be handled by CreatePost component
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      const result: LikeResponse = await response.json();
      
      if (result.success) {
        // Update the post in the list
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likes_count: result.likes_count, is_liked: result.is_liked }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove the post from the list
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      } else {
        throw new Error(result.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleComment = async (postId: number, content: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          user_id: user.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update the comments count for the post
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, comments_count: post.comments_count + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      const result: LikeResponse = await response.json();
      
      if (result.success) {
        // The comment will be refreshed when the comments are fetched
        // This is handled in the PostCard component
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className='text-xl font-semibold text-gray-900'>Social Media App</h1>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-700'>
                Welcome, {user.firstname} {user.lastname}!
              </span>
              <button
                onClick={handleLogout}
                className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Create Post */}
        <CreatePost onSubmit={handleCreatePost} isSubmitting={isSubmittingPost} />
        
        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
            {error}
          </div>
        )}

        {/* Posts Feed */}
        <div className='space-y-4'>
          {posts.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 text-lg'>No posts yet. Create the first post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                onLike={handleLikePost}
                onDelete={handleDeletePost}
                onComment={handleComment}
                onCommentLike={handleCommentLike}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;