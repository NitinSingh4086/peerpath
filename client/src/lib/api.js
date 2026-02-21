import { supabase } from "./supabase";

const BASE = "/api";

async function getHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(method, path, body) {
  const headers = await getHeaders();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // Posts
  getPosts: () => request("GET", "/posts"),
  createPost: (body) => request("POST", "/posts", body),
  deletePost: (id) => request("DELETE", `/posts/${id}`),

  // Volunteers
  volunteer: (postId) => request("POST", `/posts/${postId}/volunteer`),
  unvolunteer: (postId) => request("DELETE", `/posts/${postId}/volunteer`),
  getVolunteers: (postId) => request("GET", `/posts/${postId}/volunteer`),

  // AI
  getAIResources: (body) => request("POST", "/ai/resources", body),
  generateSummary: (body) => request("POST", "/ai/summary", body),

  // YouTube
  searchYouTube: (q) => request("GET", `/youtube?q=${encodeURIComponent(q)}`),

  // Profile
  getProfile: () => request("GET", "/profile"),
  updateProfile: (body) => request("PUT", "/profile", body),

  // Users search
  searchUsers: (q) => request("GET", `/users?q=${encodeURIComponent(q)}`),

  // Conversations
  getConversations: () => request("GET", "/conversations"),
  createConversation: (body) => request("POST", "/conversations", body),

  // Messages
  getMessages: (convId) => request("GET", `/messages/index?conv_id=${convId}`),
  sendMessage: (convId, body) => request("POST", `/messages/index?conv_id=${convId}`, { body }),
};
