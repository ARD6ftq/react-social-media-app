'use client';
import React, { useState } from 'react';
import { Comment } from '../types/post';
import { formatDistanceToNow } from 'date-fns';

interface CommentsProps {
  comments: Comment[];
  currentUserId: number;
  onComment: (content: string) => Promise<void>;
  onCommentLike: (commentId: number) => Promise<void>;
}

const Comments: React.FC<CommentsProps> = ({
  comments,
  currentUserId,
  onComment,
  onCommentLike
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: number) => {
    if (isLiking === commentId) return;
    
    setIsLiking(commentId);
    try {
      await onCommentLike(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    } finally {
      setIsLiking(null);
    }
  };

  return (
    <div>
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* Comment Author Avatar */}
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {comment.author.firstname[0]}{comment.author.lastname[0]}
              </div>
              
              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {comment.author.firstname} {comment.author.lastname}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-gray-800 text-sm mb-2">{comment.content}</p>
                
                {/* Comment Like Button */}
                <button
                  onClick={() => handleLike(comment.id)}
                  disabled={isLiking === comment.id}
                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-colors ${
                    comment.is_liked
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'
                  } disabled:opacity-50`}
                >
                  <span>{comment.is_liked ? '❤️' : '🤍'}</span>
                  <span>
                    {isLiking === comment.id ? '...' : comment.likes_count}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
