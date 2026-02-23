import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchingDemandApi } from '@/lib/api/matching-demand';
import { matchingSupplyApi } from '@/lib/api/matching-supply';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/utils';
import type { DemandMessage, SupplyMessage } from '@/types/api';

type Message = DemandMessage | SupplyMessage;

export function MessageThreadPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();

  // Determine type from URL path
  const isDemand = location.pathname.includes('/messages/demand/');
  const type = isDemand ? 'demand' : 'supply';

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    try {
      const data =
        type === 'demand'
          ? await matchingDemandApi.getMessages(id)
          : await matchingSupplyApi.getMessages(id);
      setMessages(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'メッセージの取得に失敗しました';
      setError(message);
    }
  }, [id, type]);

  // Initial load
  useEffect(() => {
    (async () => {
      await fetchMessages();
      setLoading(false);
    })();
  }, [fetchMessages]);

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!id || !inputText.trim()) return;
    setSending(true);
    try {
      const newMessage =
        type === 'demand'
          ? await matchingDemandApi.sendMessage(id, { content: inputText.trim() })
          : await matchingSupplyApi.sendMessage(id, { content: inputText.trim() });
      setMessages((prev) => [...prev, newMessage]);
      setInputText('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'メッセージの送信に失敗しました';
      alert(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !sending) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="メッセージ" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader title="メッセージ" showBack />
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <AppHeader title="メッセージ" showBack showNotification={false} />

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 space-y-3">
        {messages.length === 0 && (
          <EmptyState message="メッセージはまだありません" />
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {/* Sender name (for others) */}
                {!isOwn && msg.sender && (
                  <p className="text-xs text-gray-500 mb-0.5 ml-1">
                    {msg.sender.lastName} {msg.sender.firstName}
                  </p>
                )}

                {/* Message bubble */}
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    isOwn
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>

                {/* Timestamp */}
                <p
                  className={`text-xs text-gray-400 mt-0.5 ${
                    isOwn ? 'text-right mr-1' : 'ml-1'
                  }`}
                >
                  {formatDateTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="メッセージを入力..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <button
            type="button"
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              inputText.trim() && !sending
                ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                : 'bg-gray-200 text-gray-400'
            }`}
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
