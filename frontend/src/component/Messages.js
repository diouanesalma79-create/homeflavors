import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import messageService from '../services/messageService';
import authService from '../services/authService';
import '../style/Messages.css';

// ─── Helpers (stable — defined outside component, never recreated) ─────────────
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getRoleLabel = (role) => {
  if (role === 'cook') return 'Chef';
  if (role === 'customer') return 'Visitor';
  return role || 'User';
};

// Stable Avatar component — defined outside so it never causes parent re-renders
const Avatar = React.memo(({ name, photo, size = 44 }) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div
      className="avatar-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────
const Messages = () => {
  const navigate = useNavigate();

  // Auth
  const [currentUser, setCurrentUser]         = useState(null);

  // Conversations sidebar
  const [conversations, setConversations]     = useState([]);
  const [convsLoading, setConvsLoading]       = useState(true);

  // Active chat
  const [activePartner, setActivePartner]     = useState(null);
  const [messages, setMessages]               = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Message input
  const [newMessage, setNewMessage]           = useState('');
  const [sending, setSending]                 = useState(false);
  const [sendError, setSendError]             = useState('');

  // Search
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [showSearch, setShowSearch]           = useState(false);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const chatContainerRef   = useRef(null);  // the scrollable messages div
  const messagesEndRef     = useRef(null);  // anchor at bottom of messages
  const msgPollRef         = useRef(null);  // single interval for message polling
  const convPollRef        = useRef(null);  // single interval for conv polling
  const debounceRef        = useRef(null);  // search debounce timer
  const activePartnerRef   = useRef(null);  // stable ref for use inside intervals
  const isSendingRef       = useRef(false); // tracks if WE just sent a message
  const prevMsgCountRef    = useRef(0);     // tracks message count for smart scroll

  // Keep activePartner ref in sync with state (for interval closures)
  useEffect(() => {
    activePartnerRef.current = activePartner;
  }, [activePartner]);

  // ─── Smart Scroll Logic ────────────────────────────────────────────────────
  // Only scroll to bottom when:
  //   1. We just sent a message (isSendingRef.current === true)
  //   2. We just opened a conversation (fresh load)
  //   3. New messages arrived AND the user is already near the bottom
  const maybeScrollToBottom = useCallback((forceScroll = false) => {
    const container = chatContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // "Near the bottom" = within 120px of the bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;

    if (forceScroll || isNearBottom) {
      // Use instant scroll for conversation switches, smooth for new messages
      messagesEndRef.current?.scrollIntoView({
        behavior: forceScroll ? 'instant' : 'smooth',
        block: 'end',
      });
    }
  }, []);

  // ─── Smart scroll on messages update ──────────────────────────────────────
  useEffect(() => {
    const newCount = messages.length;
    const prevCount = prevMsgCountRef.current;
    prevMsgCountRef.current = newCount;

    // No messages or same count (shouldn't happen but guard it)
    if (newCount === 0) return;

    if (isSendingRef.current) {
      // We just sent a message — always scroll to bottom
      isSendingRef.current = false;
      maybeScrollToBottom(true);
    } else if (newCount !== prevCount) {
      // New messages arrived (could be from polling or initial load)
      // Only force-scroll on initial load (prevCount was 0), otherwise use smart scroll
      maybeScrollToBottom(prevCount === 0);
    }
    // If count is the same (polling returned same data) — do nothing
  }, [messages, maybeScrollToBottom]);

  // ─── Initial load: auth + conversations ────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const me = await authService.getMe();
        setCurrentUser(me);
        await loadConversations(true);
      } catch {
        navigate('/login');
      } finally {
        setConvsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ─── Conversations polling — every 10s, no spinner, no scroll ──────────────
  useEffect(() => {
    convPollRef.current = setInterval(() => {
      loadConversations(false);
    }, 10000);

    return () => clearInterval(convPollRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Messages polling — every 5s, only when a chat is open ─────────────────
  // Smart: only updates state if new messages actually arrived
  useEffect(() => {
    clearInterval(msgPollRef.current);

    if (activePartner) {
      msgPollRef.current = setInterval(async () => {
        const partner = activePartnerRef.current;
        if (!partner) return;
        try {
          const data = await messageService.getChatHistory(partner.id);
          if (!Array.isArray(data)) return;
          // Only update state if the message count changed — avoids unnecessary re-renders
          setMessages(prev => {
            if (data.length !== prev.length) return data;
            // Also check last message id to catch edits (future-proof)
            const lastNew = data[data.length - 1];
            const lastOld = prev[prev.length - 1];
            if (lastNew?.id !== lastOld?.id) return data;
            return prev; // same data — return same reference, no re-render
          });
        } catch {
          // silently fail background polls
        }
      }, 5000);
    }

    return () => clearInterval(msgPollRef.current);
  }, [activePartner]);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const loadConversations = useCallback(async (showSpinner = true) => {
    if (showSpinner) setConvsLoading(true);
    try {
      const data = await messageService.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      if (showSpinner) setConvsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (partnerId) => {
    setMessagesLoading(true);
    prevMsgCountRef.current = 0; // reset so initial load always scrolls to bottom
    try {
      const data = await messageService.getChatHistory(partnerId);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // ─── Search with debounce (400ms) ──────────────────────────────────────────
  const handleSearchChange = useCallback((e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setShowSearch(true);
      try {
        const results = await messageService.searchUsers(q.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, []);

  // ─── Open / Start a conversation ────────────────────────────────────────────
  const openChat = useCallback((partner) => {
    // Don't reload if already chatting with this person
    if (activePartnerRef.current?.id === partner.id) {
      setShowSearch(false);
      setSearchQuery('');
      return;
    }

    setActivePartner(partner);
    setMessages([]);       // clear messages immediately — avoids flashing old content
    setSendError('');
    prevMsgCountRef.current = 0;
    loadMessages(partner.id);

    // Add to sidebar if it's a new conversation
    setConversations(prev => {
      const exists = prev.find(c => c.participant?.id === partner.id);
      if (exists) return prev;
      return [{
        id: partner.id,
        participant: partner,
        lastMessage: '',
        timestamp: null,
        unread: false,
        unreadCount: 0,
      }, ...prev];
    });

    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  }, [loadMessages]);

  // ─── Send a message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !activePartner || sending) return;

    setSending(true);
    setSendError('');
    isSendingRef.current = true; // signal smart scroll to force-scroll after this

    try {
      const sent = await messageService.sendMessage(activePartner.id, trimmed);
      setMessages(prev => [...prev, sent]);
      setNewMessage('');

      // Update sidebar last message
      setConversations(prev => prev.map(c =>
        c.participant?.id === activePartner.id
          ? { ...c, lastMessage: trimmed, timestamp: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      isSendingRef.current = false; // cancel forced scroll if send failed
      const msg = err?.response?.data?.message || 'Failed to send message. Please try again.';
      setSendError(msg);
    } finally {
      setSending(false);
    }
  }, [newMessage, activePartner, sending]);

  // Enter key handler (no shift for multiline)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }, [handleSend]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (!currentUser && convsLoading) {
    return (
      <div className="messages-container">
        <div className="messages-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-conversations">
            <div className="loading-spinner" />
            <p>Loading your inbox...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-layout">

        {/* ── LEFT SIDEBAR ─────────────────────────────── */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <h2>💬 Messages</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search chefs & visitors..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Search results panel */}
          {showSearch ? (
            <div className="search-results">
              {searchLoading ? (
                <div className="loading-conversations" style={{ padding: '1rem' }}>
                  <div className="loading-spinner" style={{ width: '1.2rem', height: '1.2rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>Searching...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="no-search-results">
                  <p>No users found for "<strong>{searchQuery}</strong>"</p>
                </div>
              ) : (
                searchResults.map(user => (
                  <div
                    key={user.id}
                    className="search-result-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openChat(user)}
                  >
                    <div className="conversation-avatar">
                      <Avatar name={user.name} photo={user.profilePhoto} size={40} />
                    </div>
                    <div className="conversation-info">
                      <div className="participant-name">{user.name}</div>
                      <div className="search-user-email">
                        <span className="user-email">{user.email}</span>
                      </div>
                      <div className="participant-role">{getRoleLabel(user.role)}</div>
                    </div>
                    {conversations.find(c => c.participant?.id === user.id) && (
                      <span className="existing-conversation-badge" title="Existing conversation">💬</span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Conversations list */
            <div className="conversations-list">
              {convsLoading ? (
                <div className="loading-conversations">
                  <div className="loading-spinner" />
                  <p>Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="empty-chat-state" style={{ padding: '2rem 1rem' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✉️</p>
                  <h3 style={{ fontSize: '0.95rem' }}>No conversations yet</h3>
                  <p style={{ fontSize: '0.82rem' }}>Search for a user above to start chatting</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const partner = conv.participant;
                  if (!partner) return null;
                  const isActive = activePartner?.id === partner.id;
                  return (
                    <div
                      key={`conv-${conv.id ?? partner.id}`}
                      className={`conversation-item ${isActive ? 'active' : ''}`}
                      onClick={() => openChat(partner)}
                    >
                      <div className="conversation-avatar">
                        <Avatar name={partner.name} photo={partner.profilePhoto} size={44} />
                      </div>
                      <div className="conversation-info">
                        <div className="conversation-header">
                          <span className="participant-name">{partner.name}</span>
                          {conv.timestamp && (
                            <span className="message-time">{formatTime(conv.timestamp)}</span>
                          )}
                        </div>
                        <div className="conversation-preview">
                          <span className="last-message">
                            {conv.lastMessage || 'Start a conversation...'}
                          </span>
                          {conv.unread && (
                            <span className="unread-badge" title={`${conv.unreadCount} unread`}>•</span>
                          )}
                        </div>
                        <span className="participant-role">{getRoleLabel(partner.role)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT CHAT AREA ──────────────────────────── */}
        <div className="chat-area">
          {!activePartner ? (
            <div className="empty-chat-state">
              <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</p>
              <h3>Welcome to your inbox</h3>
              <p>Search for a chef or visitor on the left,<br />or select an existing conversation.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <div className="chat-participant">
                  <div className="participant-avatar">
                    <Avatar name={activePartner.name} photo={activePartner.profilePhoto} size={40} />
                  </div>
                  <div className="participant-info">
                    <h3>{activePartner.name}</h3>
                    <p>{getRoleLabel(activePartner.role)}</p>
                  </div>
                </div>
              </div>

              {/* ── Scrollable messages area — ref attached HERE ── */}
              <div className="messages-container-inner" ref={chatContainerRef}>
                {messagesLoading ? (
                  <div className="loading-conversations" style={{ margin: 'auto' }}>
                    <div className="loading-spinner" />
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="conversation-starter">
                    <div className="starter-message">
                      <p>👋 Say hello to <strong>{activePartner.name}</strong>!</p>
                      <p className="starter-subtext">Start your conversation below.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    // Stable key — always prefer real id over index
                    const key = msg.id
                      ? `msg-${msg.id}`
                      : `msg-${msg.senderId}-${msg.timestamp}`;
                    const isOwn = msg.isOwn ?? (msg.senderId === currentUser?.id);
                    return (
                      <div
                        key={key}
                        className={`message-bubble ${isOwn ? 'own-message' : 'other-message'}`}
                      >
                        <div className="message-content">
                          <p>{msg.content}</p>
                          <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Scroll anchor — always at the very bottom */}
                <div ref={messagesEndRef} style={{ height: 1, flexShrink: 0 }} />
              </div>

              {/* Error banner */}
              {sendError && (
                <div
                  className="error-message"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{sendError}</span>
                  <button
                    onClick={() => setSendError('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '1rem' }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Send form */}
              <form className="message-input-form" onSubmit={handleSend}>
                <input
                  type="text"
                  className="message-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Enter to send)"
                  disabled={sending}
                  maxLength={2000}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;