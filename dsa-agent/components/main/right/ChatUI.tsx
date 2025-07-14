'use client'
import { cn } from '@/lib/utils';
import { useStatusStore } from '@/store/statusStore';
import { Check, Loader2 } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useQuestionsStore } from '@/store/questionsStore';

export default function ChatUI() {
  const status = useStatusStore(s => s.status);
  console.log(status)
  const [chat, setChat] = useState<{ sender: 'user' | 'bot'; message: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('sessionId', id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim() || loading || !sessionId) return;
    const userMsg = input;
    setChat(prev => [...prev, { sender: 'user', message: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, sessionId }),
      });
      const data = await res.json();
      if (data.type === 'json') {
        if (data?.tool === "get_problems"){
          useQuestionsStore.getState().updateQuestions(data.problems);
        }
        setChat(prev => [...prev, { sender: 'bot', message: data.completion }]);
      } else if (data.type === 'text') {
        setChat(prev => [...prev, { sender: 'bot', message: data.text }]);
      } else {
        setChat(prev => [...prev, { sender: 'bot', message: '[Unknown response type]' }]);
      }
    } catch (e) {
      setChat(prev => [...prev, { sender: 'bot', message: 'Error: Could not fetch response.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-1.5 flex-col h-full w-full">
      {/* Top: Messages */}
      <div className="flex-1 mb-1 no-scrollbar min-h-0 overflow-y-scroll p-4 relative space-y-2 bg-neutral-900 rounded-xl">
        {chat.map((msg, idx) => (
          msg.sender === 'bot' ? (
            <div
              key={idx}
              className={`block w-fit max-w-[80%] rounded-2xl px-3 py-2 text-sm mr-auto bg-neutral-800 text-neutral-200 markdown-chat`}
            >
              <ReactMarkdown>{msg.message}</ReactMarkdown>
            </div>
          ) : (
            <span
              key={idx}
              className={`block w-fit max-w-[88%] rounded-2xl px-3 py-2 text-sm ml-auto bg-blue-700 text-white`}
            >
              {msg.message}
            </span>
          )
        ))}
        <div ref={messagesEndRef} />

      </div>

      {/* Bottom: Input */}
      <div className="flex flex-col relative w-full items-start p-2 bg-neutral-900 rounded-xl">
        {

          <div className='absolute flex items-center h-6 border bg-neutral-900 w-11/12 right-1/2 translate-x-1/2 rounded-full -top-[26px]'>

            {loading && (
              <div className={cn("flex items-center text-[11px] text-start ml-1.5  bg-neutral-800 rounded-full px-4 transition-all duration-500")}>
                {
                  status !== 'Done' ?
                    <Loader2 className='animate-spin text-white ' size={10} /> :
                    <Check className='text-white ' size={10} />

                }

                <span className='ml-2 animate-pulse'>{status !== 'idle' ? status : 'waiting for response...'}</span>

              </div>
            )
            }
          </div>
        }
        <textarea
          rows={4}
          className="flex-1 w-full rounded-lg  text-sm text-neutral-100 px-3 py-2 outline-none resize-none no-scrollbar mb-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Waiting for response...' : 'Type a message...'}
          disabled={loading}
        />
        <button
          className="ml-auto  h-8 w-fit px-4 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          send
        </button>
      </div>
    </div>
  );
}
