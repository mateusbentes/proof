import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import chatService from '../services/chatService';

export const useChatStore = create(
  devtools(
    persist(
      (set, get) =&gt; ({
        // State
        threads: [],
        activeThreadId: null,
        messages: [],
        loadingThreads: false,
        loadingMessages: false,
        sendingMessage: false,
        error: null,

        // Actions
        fetchThreads: async () =&gt; {
          const { threads, loadingThreads } = get();
          if (loadingThreads || threads.length &gt; 0) return;

          set({ loadingThreads: true, error: null });
          try {
            const fetchedThreads = await chatService.getThreads();
            set({ 
              threads: fetchedThreads, 
              loadingThreads: false 
            });
          } catch (error) {
            set({ 
              loadingThreads: false, 
              error: error.message 
            });
          }
        },

        setActiveThread: (threadId) =&gt; {
          set({ activeThreadId: threadId });
        },

        fetchMessages: async (threadId) =&gt; {
          set({ loadingMessages: true, error: null, messages: [] });
          try {
            const messages = await chatService.getMessages(threadId);
            set({ 
              messages, 
              loadingMessages: false 
            });
          } catch (error) {
            set({ 
              loadingMessages: false, 
              error: error.message 
            });
          }
        },

        sendMessage: async (threadId, messageData) =&gt; {
          const { activeThreadId } = get();
          if (activeThreadId !== threadId) return;

          set({ sendingMessage: true });
          try {
            const optimisticMessage = {
              id: Date.now().toString(),
              ...messageData,
              createdAt: new Date().toISOString(),
              sending: true
            };
            
            // Optimistic update
            set((state) =&gt; ({
              messages: [...state.messages, optimisticMessage]
            }));

            const message = await chatService.sendMessage(threadId, messageData);
            
            // Replace optimistic message
            set((state) =&gt; ({
              messages: state.messages.map((m) =&gt;
                m.id === optimisticMessage.id ? { ...message, sending: false } : m
              )
            }));
          } catch (error) {
            // Remove optimistic message on error
            set((state) =&gt; ({
              messages: state.messages.filter((m) =&gt; !m.sending)
            }));
            throw error;
          } finally {
            set({ sendingMessage: false });
          }
        },

        receiveNewMessage: (message) =&gt; {
          const { activeThreadId, messages } = get();
          if (message.threadId === activeThreadId) {
            set({ 
              messages: [...messages, message] 
            });
          }
        },

        updateThread: (thread) =&gt; {
          set((state) =&gt; ({
            threads: state.threads.map((t) =&gt;
              t.id === thread.id ? { ...t, ...thread } : t
            )
          }));
        },

        clearError: () =&gt; set({ error: null }),

        // Expose store instance for socket events
        storeInstance: null
      }),
      {
        name: 'chat-storage',
        partialize: (state) =&gt; ({ 
          threads: state.threads, 
          activeThreadId: state.activeThreadId 
        })
      }
    ),
    { name: 'chat-store' }
  )
);

// Make store globally accessible for socket events (temporary solution)
const store = useChatStore;
store.getState().storeInstance = store;
window.chatStore = store;

export default useChatStore;
