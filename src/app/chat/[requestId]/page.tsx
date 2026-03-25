
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Send, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, useDoc } from '@/firebase';
import {
  collection, doc, addDoc, onSnapshot, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { UserProfile, ChatMessage } from '@/lib/types';

export default function ChatPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const db = useFirestore();
  const { user: authUser } = useUser();

  const profileRef = useMemo(() => authUser ? doc(db, 'users', authUser.uid) : null, [db, authUser]);
  const { data: userProfile } = useDoc<UserProfile>(profileRef);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!requestId) return;
    const q = query(
      collection(db, 'serviceRequests', requestId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const msgs: ChatMessage[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [db, requestId]);

  const handleSend = async () => {
    if (!text.trim() || !authUser || !userProfile) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'serviceRequests', requestId, 'messages'), {
        requestId,
        senderId: authUser.uid,
        senderName: userProfile.name,
        senderRole: userProfile.role,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });
      setText('');
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const isMe = (msg: ChatMessage) => msg.senderId === authUser?.uid;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50">
      {/* Header */}
      <header className="bg-[#0a111a] text-white px-6 py-4 flex items-center gap-3 sticky top-0 z-50 shadow-lg">
        <Link href="/dashboard" className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-lg">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Chat de Mission</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">#{requestId?.slice(-6)}</p>
          </div>
        </div>
        <span className="ml-auto text-[10px] text-green-400 font-bold">● En direct</span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-3 py-20">
            <MessageCircle className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">Aucun message pour le moment.</p>
            <p className="text-xs">Dites bonjour à votre Ange !</p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
              isMe(msg)
                ? 'bg-accent text-white rounded-br-md'
                : 'bg-white text-[#0a111a] rounded-bl-md border border-slate-100'
            }`}>
              {!isMe(msg) && (
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">{msg.senderName}</p>
              )}
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[9px] mt-1 ${isMe(msg) ? 'text-white/60 text-right' : 'text-slate-400'}`}>
                {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-slate-100 shadow-lg">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Écrivez un message..."
            className="flex-1 h-12 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-accent/20"
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="h-12 w-12 bg-accent hover:bg-accent/90 text-white rounded-2xl flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
