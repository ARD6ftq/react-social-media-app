export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: User;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: User;
  likes_count: number;
  is_liked: boolean;
}

export interface PostLike {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

export interface CommentLike {
  id: number;
  user_id: number;
  comment_id: number;
  created_at: string;
}

export interface CreatePostData {
  content: string;
}

export interface CreateCommentData {
  content: string;
  post_id: number;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  likes_count: number;
  is_liked: boolean;
}
