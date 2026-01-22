import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Bell, Home, User, Users, Send, X, Check, Image, Upload } from 'lucide-react';

const SocialNetworkPlatform = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState('login');
  const [showNotifications, setShowNotifications] = useState(false);
  const [newPost, setNewPost] = useState({ text: '', image: '' });
  const [commentText, setCommentText] = useState({});

  // Initialize demo data
  useEffect(() => {
    const demoUsers = [
      { id: 1, username: 'alice_wonder', name: 'Alice Wonder', bio: 'Adventure enthusiast 🌍', avatar: '👩', friends: [2, 3], posts: [] },
      { id: 2, username: 'bob_builder', name: 'Bob Builder', bio: 'Building dreams one brick at a time 🏗️', avatar: '👨', friends: [1], posts: [] },
      { id: 3, username: 'charlie_tech', name: 'Charlie Tech', bio: 'Tech lover | Developer | Gamer 💻', avatar: '🧑', friends: [1], posts: [] },
      { id: 4, username: 'diana_art', name: 'Diana Artist', bio: 'Digital artist & creator 🎨', avatar: '👩‍🎨', friends: [], posts: [] },
      { id: 5, username: 'eve_music', name: 'Eve Melody', bio: 'Music is life 🎵', avatar: '👩‍🎤', friends: [], posts: [] }
    ];

    const demoPosts = [
      {
        id: 1,
        userId: 2,
        text: 'Just finished building an amazing treehouse! 🏡',
        image: '🏠',
        likes: [1, 3],
        comments: [
          { id: 1, userId: 1, text: 'Looks amazing! Can I visit?', timestamp: Date.now() - 3600000 }
        ],
        timestamp: Date.now() - 7200000
      },
      {
        id: 2,
        userId: 3,
        text: 'New coding project in the works. Stay tuned! 💻',
        image: '💻',
        likes: [1],
        comments: [],
        timestamp: Date.now() - 10800000
      },
      {
        id: 3,
        userId: 1,
        text: 'Exploring the mountains this weekend! Who wants to join? ⛰️',
        image: '⛰️',
        likes: [2, 3],
        comments: [
          { id: 2, userId: 2, text: 'Count me in!', timestamp: Date.now() - 1800000 }
        ],
        timestamp: Date.now() - 14400000
      }
    ];

    setUsers(demoUsers);
    setPosts(demoPosts);
  }, []);

  // Authentication
  const handleLogin = (username) => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('feed');
      addNotification('Welcome back! 👋', 'info');
    }
  };

  const handleSignup = (username, name, bio) => {
    const newUser = {
      id: users.length + 1,
      username,
      name,
      bio: bio || 'New user on the platform!',
      avatar: '👤',
      friends: [],
      posts: []
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setCurrentPage('feed');
    addNotification('Account created successfully! 🎉', 'success');
  };

  // Posts
  const createPost = () => {
    if (!newPost.text.trim()) return;

    const post = {
      id: posts.length + 1,
      userId: currentUser.id,
      text: newPost.text,
      image: newPost.image,
      likes: [],
      comments: [],
      timestamp: Date.now()
    };

    setPosts([post, ...posts]);
    setNewPost({ text: '', image: '' });
    addNotification('Post created! 📝', 'success');
    
    // Notify friends
    currentUser.friends.forEach(friendId => {
      if (friendId !== currentUser.id) {
        broadcastNotification(friendId, `${currentUser.name} posted something new!`, 'post');
      }
    });
  };

  const toggleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(currentUser.id);
        const newLikes = hasLiked
          ? post.likes.filter(id => id !== currentUser.id)
          : [...post.likes, currentUser.id];

        if (!hasLiked) {
          const postOwner = users.find(u => u.id === post.userId);
          if (post.userId !== currentUser.id) {
            broadcastNotification(post.userId, `${currentUser.name} liked your post! ❤️`, 'like');
          }
        }

        return { ...post, likes: newLikes };
      }
      return post;
    }));
  };

  const addComment = (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const comment = {
          id: post.comments.length + 1,
          userId: currentUser.id,
          text,
          timestamp: Date.now()
        };

        if (post.userId !== currentUser.id) {
          broadcastNotification(post.userId, `${currentUser.name} commented on your post! 💬`, 'comment');
        }

        return { ...post, comments: [...post.comments, comment] };
      }
      return post;
    }));

    setCommentText({ ...commentText, [postId]: '' });
  };

  // Friend System
  const sendFriendRequest = (userId) => {
    const existing = friendRequests.find(
      req => req.from === currentUser.id && req.to === userId
    );

    if (existing) return;

    const request = {
      id: friendRequests.length + 1,
      from: currentUser.id,
      to: userId,
      status: 'pending',
      timestamp: Date.now()
    };

    setFriendRequests([...friendRequests, request]);
    const targetUser = users.find(u => u.id === userId);
    broadcastNotification(userId, `${currentUser.name} sent you a friend request! 👥`, 'friend_request');
    addNotification(`Friend request sent to ${targetUser.name}! ✉️`, 'info');
  };

  const acceptFriendRequest = (requestId) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    setUsers(users.map(user => {
      if (user.id === request.from || user.id === request.to) {
        return {
          ...user,
          friends: [...user.friends, user.id === request.from ? request.to : request.from]
        };
      }
      return user;
    }));

    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    
    const requester = users.find(u => u.id === request.from);
    broadcastNotification(request.from, `${currentUser.name} accepted your friend request! 🎉`, 'friend_accept');
    addNotification(`You are now friends with ${requester.name}! 🤝`, 'success');

    if (currentUser.id === request.to) {
      setCurrentUser({
        ...currentUser,
        friends: [...currentUser.friends, request.from]
      });
    }
  };

  const rejectFriendRequest = (requestId) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    addNotification('Friend request rejected', 'info');
  };

  // Notifications
  const addNotification = (message, type) => {
    const notif = {
      id: notifications.length + 1,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    setNotifications([notif, ...notifications]);
  };

  const broadcastNotification = (userId, message, type) => {
    // In a real app, this would use WebSockets
    if (userId === currentUser.id) {
      addNotification(message, type);
    }
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Helper functions
  const getUserById = (id) => users.find(u => u.id === id);
  
  const isFriend = (userId) => currentUser?.friends.includes(userId);
  
  const hasPendingRequest = (userId) => friendRequests.some(
    req => req.from === currentUser?.id && req.to === userId && req.status === 'pending'
  );

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Login/Signup Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">SocialHub</h1>
            <p className="text-gray-600">Connect with friends and share moments</p>
          </div>

          {currentPage === 'login' ? (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Login</h2>
              <div className="space-y-4">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleLogin(user.username)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center gap-3"
                  >
                    <span className="text-3xl">{user.avatar}</span>
                    <div className="text-left">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage('signup')}
                className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Create new account
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Sign Up</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSignup(
                  formData.get('username'),
                  formData.get('name'),
                  formData.get('bio')
                );
              }}>
                <input
                  name="username"
                  placeholder="Username"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg mb-3 focus:border-purple-500 outline-none"
                  required
                />
                <input
                  name="name"
                  placeholder="Full Name"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg mb-3 focus:border-purple-500 outline-none"
                  required
                />
                <textarea
                  name="bio"
                  placeholder="Bio (optional)"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:border-purple-500 outline-none"
                  rows="3"
                />
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Create Account
                </button>
              </form>
              <button
                onClick={() => setCurrentPage('login')}
                className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main App
  const myPosts = posts.filter(p => p.userId === currentUser.id);
  const feedPosts = posts.filter(p => 
    currentUser.friends.includes(p.userId) || p.userId === currentUser.id
  );
  const pendingRequests = friendRequests.filter(
    r => r.to === currentUser.id && r.status === 'pending'
  );
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-600">SocialHub</h1>
          
          <nav className="flex gap-6">
            <button
              onClick={() => setCurrentPage('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'feed' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home size={20} />
              <span className="font-medium">Feed</span>
            </button>
            
            <button
              onClick={() => setCurrentPage('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'friends' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              <span className="font-medium">Friends</span>
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setCurrentPage('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'profile' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
            </button>
          </nav>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-full"
            >
              <Bell size={24} className="text-gray-600" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                        !notif.read ? 'bg-purple-50' : ''
                      }`}
                    >
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(notif.timestamp)}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Feed Page */}
        {currentPage === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-3">
                <span className="text-4xl">{currentUser.avatar}</span>
                <div className="flex-1">
                  <textarea
                    value={newPost.text}
                    onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
                    placeholder="What's on your mind?"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none focus:border-purple-500 outline-none"
                    rows="3"
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <select
                      value={newPost.image}
                      onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                      className="p-2 border-2 border-gray-200 rounded-lg"
                    >
                      <option value="">No image</option>
                      <option value="📷">📷 Camera</option>
                      <option value="🎨">🎨 Art</option>
                      <option value="🌅">🌅 Sunset</option>
                      <option value="🍕">🍕 Food</option>
                      <option value="✈️">✈️ Travel</option>
                    </select>
                    <button
                      onClick={createPost}
                      className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            {feedPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                <p>No posts yet. Add some friends or create your first post!</p>
              </div>
            ) : (
              feedPosts.map(post => {
                const author = getUserById(post.userId);
                return (
                  <div key={post.id} className="bg-white rounded-lg shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{author.avatar}</span>
                        <div>
                          <div className="font-semibold">{author.name}</div>
                          <div className="text-sm text-gray-500">{formatTime(post.timestamp)}</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-800 mb-3">{post.text}</p>
                      
                      {post.image && (
                        <div className="text-6xl my-4">{post.image}</div>
                      )}

                      <div className="flex gap-6 py-3 border-t border-b">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-2 ${
                            post.likes.includes(currentUser.id) ? 'text-red-500' : 'text-gray-600'
                          } hover:text-red-500`}
                        >
                          <Heart size={20} fill={post.likes.includes(currentUser.id) ? 'currentColor' : 'none'} />
                          <span>{post.likes.length}</span>
                        </button>
                        
                        <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                          <MessageCircle size={20} />
                          <span>{post.comments.length}</span>
                        </button>
                      </div>

                      {/* Comments */}
                      <div className="mt-4 space-y-3">
                        {post.comments.map(comment => {
                          const commenter = getUserById(comment.userId);
                          return (
                            <div key={comment.id} className="flex gap-3">
                              <span className="text-2xl">{commenter.avatar}</span>
                              <div className="flex-1 bg-gray-100 rounded-lg p-3">
                                <div className="font-semibold text-sm">{commenter.name}</div>
                                <p className="text-sm">{comment.text}</p>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex gap-3 mt-4">
                          <span className="text-2xl">{currentUser.avatar}</span>
                          <input
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                            placeholder="Write a comment..."
                            className="flex-1 p-2 border-2 border-gray-200 rounded-full px-4 focus:border-purple-500 outline-none"
                          />
                          <button
                            onClick={() => addComment(post.id)}
                            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Friends Page */}
        {currentPage === 'friends' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Friend Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
                <div className="space-y-3">
                  {pendingRequests.map(request => {
                    const requester = getUserById(request.from);
                    return (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{requester.avatar}</span>
                          <div>
                            <div className="font-semibold">{requester.name}</div>
                            <div className="text-sm text-gray-500">@{requester.username}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <Check size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(request.id)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Find Friends</h2>
              <div className="grid gap-4">
                {users.filter(u => u.id !== currentUser.id).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{user.avatar}</span>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.bio}</div>
                      </div>
                    </div>
                    <div>
                      {isFriend(user.id) ? (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                          Friends ✓
                        </span>
                      ) : hasPendingRequest(user.id) ? (
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                        >
                          <UserPlus size={16} />
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Page */}
        {currentPage === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg"></div>
              <div className="px-6 pb-6">
                <div className="flex items-end gap-6 -mt-16">
                  <div className="text-8xl bg-white rounded-full p-4 shadow-lg">
                    {currentUser.avatar}
                  </div>
                  <div className="flex-1 mt-16">
                    <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                    <p className="text-gray-600">@{currentUser.username}</p>
                    <p className="mt-2">{currentUser.bio}</p>
                    <div className="flex gap-6 mt-4">
                      <div>
                        <span className="font-bold">{myPosts.length}</span>
                        <span className="text-gray-600 ml-1">Posts</span>
                      </div>
                      <div>
                        <span className="font-bold">{currentUser.friends.length}</span>
                        <span className="text-gray-600 ml-1">Friends</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">My Posts</h3>
              {myPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No posts yet</p>
              ) : (
                <div className="space-y-4">
                  {myPosts.map(post => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <p className="mb-2">{post.text}</p>
                      {post.image && <div className="text-4xl mb-2">{post.image}</div>}
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>❤️ {post.likes.length} likes</span>
                        <span>💬 {post.comments.length} comments</span>
                        <span className="ml-auto">{formatTime(post.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SocialNetworkPlatform;
