import React from 'react';
import { Post } from '../types/post'; // Assuming you have a Post type defined

type PostCardProps = {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
};

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={post.userAvatar || '/default-avatar.png'}
            alt={post.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-lg">{post.username}</p>
            <p className="text-sm text-gray-500">{post.time}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700">{post.content}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center text-blue-500 hover:text-blue-700"
            >
              <span className="mr-1">👍</span> Like
            </button>
            <span className="text-gray-600">{post.likes} Likes</span>
          </div>

          <button
            onClick={() => onComment(post.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            💬 Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
