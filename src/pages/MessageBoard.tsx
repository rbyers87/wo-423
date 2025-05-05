import React, { useState, useEffect } from 'react';
    import { supabase } from '../lib/supabase';
    import { useAuth } from '../contexts/AuthContext';
    import { ThumbUp, ThumbDown, Trash2 } from 'lucide-react';
    import { LoadingSpinner } from '../components/common/LoadingSpinner';

    interface Message {
      id: string;
      content: string;
      created_at: string;
      profile_id: string;
      profiles: {
        profile_name: string;
      };
      likes: number;
      dislikes: number;
      user_has_liked: boolean;
      user_has_disliked: boolean;
    }

    export default function MessageBoard() {
      const { user } = useAuth();
      const [messages, setMessages] = useState<Message[]>([]);
      const [newMessage, setNewMessage] = useState('');
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        async function fetchMessages() {
          setLoading(true);
          try {
            const { data, error } = await supabase
              .from('messages')
              .select(`
                *,
                profiles (
                  profile_name
                )
              `)
              .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
          } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages. Please try again later.');
          } finally {
            setLoading(false);
          }
        }

        fetchMessages();
      }, []);

      const handlePostMessage = async () => {
        if (!user) return;
        if (!newMessage.trim()) return;

        try {
          const { data, error } = await supabase
            .from('messages')
            .insert([
              {
                content: newMessage,
                profile_id: user.id,
              },
            ])
            .select(`
              *,
              profiles (
                profile_name
              )
            `)
            .single();

          if (error) throw error;
          setMessages([data, ...messages]);
          setNewMessage('');
        } catch (error) {
          console.error('Error posting message:', error);
          setError('Failed to post message. Please try again later.');
        }
      };

      const handleLike = async (messageId: string) => {
        // Implement like functionality
      };

      const handleDislike = async (messageId: string) => {
        // Implement dislike functionality
      };

      const handleDeleteMessage = async (messageId: string) => {
        // Implement delete message functionality (admin only)
      };

      if (loading) return <LoadingSpinner />;

      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold dark:text-gray-100">Message Board</h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <button
              onClick={handlePostMessage}
              className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Post Message
            </button>
          </div>

          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium dark:text-gray-100">
                      {message.profiles?.profile_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2 dark:text-gray-300">{message.content}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={() => handleLike(message.id)}
                    className="text-gray-500 hover:text-indigo-600"
                  >
                    <ThumbUp className="h-5 w-5" />
                    <span>{message.likes}</span>
                  </button>
                  <button
                    onClick={() => handleDislike(message.id)}
                    className="text-gray-500 hover:text-indigo-600"
                  >
                    <ThumbDown className="h-5 w-5" />
                    <span>{message.dislikes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
