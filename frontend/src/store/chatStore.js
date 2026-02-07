import create from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

export const useChatStore = create(
  persist(
    (set, get) => ({
      threads: [],
      messages: {},
      selectedThread: null,
      loading: false,
      error: null,

      setSelectedThread: (thread) => set({ selectedThread: thread }),

      loadThreads: async () => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.get('/chat/threads');
          set({ threads: response.data.threads || [] });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      loadMessages: async (threadId) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.get(`/chat/threads/${threadId}/messages`);
          set((state) => ({
            messages: {
              ...state.messages,
              [threadId]: response.data.messages || [],
            },
          }));
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      sendMessage: async (threadId, content) => {
        try {
          const response = await apiClient.post(`/chat/threads/${threadId}/messages`, {
            content,
          });

          set((state) => ({
            messages: {
              ...state.messages,
              [threadId]: [...(state.messages[threadId] || []), response.data],
            },
          }));

          return response.data;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      addMessage: (threadId, message) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [threadId]: [...(state.messages[threadId] || []), message],
          },
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        selectedThread: state.selectedThread,
      }),
    }
  )
);
