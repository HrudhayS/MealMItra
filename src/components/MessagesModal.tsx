import React, { useState, useEffect, useRef } from 'react';
import { DonationRequest, ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  Send, 
  Phone, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DonationRequest | null;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll / fetch messages
  const loadMessages = async () => {
    if (!request) return;
    try {
      const data = await api.getMessages(request.id, currentUser);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (isOpen && request) {
      setLoading(true);
      loadMessages().finally(() => setLoading(false));

      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, request]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !request) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      setSending(true);
      const newMsg = await api.sendMessage(request.id, inputText.trim(), currentUser);
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  // Determine phone number to call/whatsapp based on who the current user is
  const isDonor = currentUser.uid === request.donorId;
  const otherPartyName = isDonor ? request.recipientName : request.donorName;
  const otherPartyRole = isDonor ? 'Recipient Organization' : 'Food Donor';
  const targetPhone = isDonor 
    ? (request.recipientPhone || '+15559876543') 
    : (request.donorPhone || '+15552345678');
  
  // Clean phone number for links
  const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');

  const whatsappMessage = encodeURIComponent(
    `Hello! Regarding MealMitra donation request for "${request.foodName}" (${request.requestedQuantity} ${request.unit}) - coordinating pickup scheduled for ${new Date(request.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full h-[620px] shadow-2xl border border-[#344E41]/15 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#FFF8ED] border-b border-[#344E41]/10 px-5 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#344E41]">{request.foodName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5EFE5] text-[#344E41] font-semibold border border-[#8BAF92]/30">
                {request.status}
              </span>
            </div>
            <p className="text-xs text-[#373A36]/70 mt-0.5">
              Thread with <strong className="text-[#344E41]">{otherPartyName}</strong> ({otherPartyRole})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#373A36]/60 hover:text-[#344E41] hover:bg-[#344E41]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Shortcuts: WhatsApp & Call (Section 4.C explicit requirement) */}
        <div className="bg-[#E5EFE5]/50 px-5 py-2.5 border-b border-[#344E41]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#344E41] font-medium">
            <Phone className="w-3.5 h-3.5 text-[#8BAF92]" />
            <span>Direct Coordinator Hotline: <strong>{targetPhone}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Link */}
            <a
              href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors shadow-2xs text-[11px]"
              title="Chat directly on WhatsApp"
            >
              <span>WhatsApp Chat</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#344E41] text-[#FFF8ED] font-medium hover:bg-[#283d32] transition-colors shadow-2xs text-[11px]"
              title="Call directly via phone"
            >
              <Phone className="w-3 h-3 text-[#8BAF92]" />
              <span>Call Now</span>
            </a>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xs text-[#373A36]/60">
              Loading conversation history...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-xs text-[#373A36]/60">
              <MessageSquare className="w-8 h-8 text-[#8BAF92] mb-2" />
              <p className="font-semibold text-[#344E41]">No messages exchanged yet</p>
              <p className="mt-1">Confirm pickup vehicle details, container sizes, or arrival estimates.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.uid;
              const isSys = msg.senderRole === 'system';

              if (isSys) {
                return (
                  <div key={msg.id} className="flex justify-center my-1.5">
                    <span className="text-[11px] bg-[#E5EFE5] text-[#344E41] px-3 py-1 rounded-full border border-[#8BAF92]/20 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8BAF92]" />
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-[#344E41]">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                      {msg.senderRole}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#344E41] text-white rounded-br-xs'
                        : 'bg-white text-[#373A36] border border-[#344E41]/10 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#344E41]/10 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type coordination message (e.g. ETA in 15 mins, van license plate)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8BAF92] text-xs"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="bg-[#8BAF92] hover:bg-[#789d7f] text-[#344E41] font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
