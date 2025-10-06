'use client';
import React, { useState } from 'react';
import { Post, Comment, LikeResponse } from '../types/post';
import { formatDistanceToNow } from 'date-fns';
import Comments from './Comments';

interface PostCardProps {
  post: Post;
  currentUserId: number;
  onLike: (postId: number) => Promise<void>;
  onDelete: (postId: number) => Promise<void>;
  onComment: (postId: number, content: string) => Promise<void>;
  onCommentLike: (commentId: number) => Promise<void>;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onDelete,
  onComment,
  onCommentLike
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await onLike(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || post.user_id !== currentUserId) return;
    
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setIsLoadingComments(true);
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${post.id}/comments?user_id=${currentUserId}`);
      const commentsData = await response.json();
      setComments(commentsData);
      setShowComments(true);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleComment = async (content: string) => {
    try {
      await onComment(post.id, content);
      // Refresh comments after adding new one
      const response = await fetch(`http://localhost:5001/api/posts/${post.id}/comments?user_id=${currentUserId}`);
      const commentsData = await response.json();
      setComments(commentsData);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      await onCommentLike(commentId);
      // Refresh comments after liking
      const response = await fetch(`http://localhost:5001/api/posts/${post.id}/comments?user_id=${currentUserId}`);
      const commentsData = await response.json();
      setComments(commentsData);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {post.author.firstname[0]}{post.author.lastname[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.author.firstname} {post.author.lastname}
            </h3>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
          {post.user_id === currentUserId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : '🗑️'}
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
              post.is_liked
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
            } disabled:opacity-50`}
          >
            <span>{post.is_liked ? '❤️' : '🤍'}</span>
            <span className="text-sm font-medium">
              {isLiking ? '...' : post.likes_count}
            </span>
          </button>

          {/* Comments Button */}
          <button
            onClick={handleShowComments}
            disabled={isLoadingComments}
            className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <span>💬</span>
            <span className="text-sm font-medium">
              {isLoadingComments ? '...' : post.comments_count}
            </span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          <Comments
            comments={comments}
            currentUserId={currentUserId}
            onComment={handleComment}
            onCommentLike={handleCommentLike}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
