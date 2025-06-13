import React, { useEffect, useState, useRef, useMemo } from 'react';
import { fetchWithAuth } from '../utils/apiCLient.js';
import { handleLogout } from '../utils/logout.js';

/**
 * Memoized message component
 * - Renders individual message with user avatar and content
 * - Memoized to prevent unnecessary re-renders
 */
const MessageComponent = React.memo(
  function MessageComponent({ msg }) {
    return (
      <div>
        <div
          className="chat-message"
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Render user avatar - either image or SVG placeholder */}
            {msg.user?.picture ? (
              <img
                src={msg.user.picture}
                alt="Avatar"
                className="avatar small"
                style={{ width: 20, height: 20 }}
              />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="avatar small"
                style={{ width: 20, height: 20 }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="#ddd"
                  stroke="#ccc"
                  strokeWidth="4"
                />
                <circle cx="50" cy="35" r="15" fill="#bbb" />
                <path d="M20 80c0-15 15-25 30-25s30 10 30 25" fill="#bbb" />
              </svg>
            )}
            {/* User name/email with mailto link */}
            <a href={`mailto:${msg.user?.email}`} className="chat-user">
              {msg.user?.name || msg.user?.email}
            </a>
          </div>
          {/* Message content - allows HTML */}
          <span
            className="chat-text"
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        </div>
      </div>
    );
  }
  // Memoization comparison function
  // (prevProps, nextProps) => {
  //   console.log(
  //     'MessageComponent - comparison:',
  //     prevProps.msg.id,
  //     nextProps.msg.id
  //   );
  //   return prevProps.msg.id === nextProps.msg.id;
  // }
);

/**
 * Memoized message list component
 * - Renders all messages with auto-scroll
 * - Memoized for performance
 */
const MessageList = React.memo(function MessageList({ messages }) {
  // console.log('MessageList - messages:', messages);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  });

  if (messages.length === 0) {
    return <div className="no-messages">No messages yet.</div>;
  }

  return (
    <div className="chat-messages">
      {messages.map((msg) => (
        <MessageComponent key={msg.id} msg={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});

/**
 * ChatPage component - displays a chat interface with messages from different users
 * Features:
 * - Real-time message display with 5 second polling interval
 * - Message input with send functionality
 * - Auto-scroll to latest messages
 * - Loading states and error handling
 * - Memoized message components for performance
 * - Message deduplication using Map
 */
const ChatPage = () => {
  const [user, setUser] = useState(null); // Current user's profile data
  const [products, setProducts] = useState([]); // Product list for sidebar
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Core state
  const [messages, setMessages] = useState([]); // Array of chat messages
  const [loading, setLoading] = useState(true); // Loading state for initial message fetch

  // Refs for managing polling and message state
  const pollTimeoutRef = useRef(null); // Stores timeout ID for message polling
  const firstLoad = useRef(true); // Tracks if this is first load to show loading state
  const messagesMap = useRef(new Map()); // Map for deduping messages by ID
  const lastMsgId = useRef(null); // Tracks ID of most recent message

  /**
   * Effect for setting up message polling on mount
   * - Sets page title
   * - Starts polling messages every 5 seconds
   * - Cleans up polling on unmount
   */
  useEffect(() => {
    let isMounted = true;
    document.title = 'Chat | OAuth Demo';

    fetchProfile();
    fetchProducts();

    // Poll messages every 5 seconds while mounted
    const pollMessages = async () => {
      await fetchMessages();
      if (isMounted) {
        pollTimeoutRef.current = setTimeout(pollMessages, 5000);
      }
    };
    pollMessages();

    // Cleanup polling on unmount
    return () => {
      isMounted = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Memoized chat input form component
   * - Handles message input and submission
   * - Clears input after sending
   * - Prevents empty message submission
   */
  const ChatInput = React.memo(function ChatInput({ onSend }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      onSend(input);
      setInput('');
    };

    return (
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          style={{ resize: 'vertical', minHeight: '3em', maxHeight: '8em' }}
        />
        <div className="send-row">
          <button type="submit" className="button send-button">
            Send
          </button>
        </div>
      </form>
    );
  });

  /**
   * Handles sending a new message
   * - Validates message text
   * - Makes API call to save message
   * - Handles success/error states
   * @param {string} text - Message text to send
   */
  const handleSend = async (text) => {
    if (!text.trim()) return;
    try {
      const data = await fetchWithAuth(`/chat/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      if (data.success) {
        // Message sent successfully - polling will pick up new message
      } else {
        // API returned error status
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  /**
   * Fetches list of messages from API
   * Returns empty array on error
   */
  const fetchMessagesList = async () => {
    try {
      return await fetchWithAuth(`/chat/messages`);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  };

  /**
   * Main message fetching logic
   * - Shows loading state on first load
   * - Dedupes messages using Map
   * - Only updates state if messages changed
   * - Tracks last message ID
   */
  const fetchMessages = async () => {
    if (firstLoad.current) setLoading(true);
    const allMessages = await fetchMessagesList();
    let changed = false;

    const newIds = new Set();
    allMessages.forEach((msg) => {
      const existing = messagesMap.current.get(msg.id);
      newIds.add(msg.id);
      if (!existing) {
        messagesMap.current.set(msg.id, msg);
        changed = true;
      }
      lastMsgId.current = msg.id;
    });

    if (newIds.size !== messagesMap.current.size) {
      [...messagesMap.current.keys()].forEach((id) => {
        if (!newIds.has(id)) {
          messagesMap.current.delete(id);
        }
      });
      changed = true;
    }

    // Update state only if needed
    if (changed || firstLoad.current) {
      setMessages([...messagesMap.current.values()]);
    }

    if (firstLoad.current) {
      setLoading(false);
      firstLoad.current = false;
    }
  };

  // Fetch products for sidebar
  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await fetchWithAuth(`/products`);
      setProducts(data);
    } catch (error) {
      setProductsError('Failed to load products');
      setProducts([]);
    }
    setProductsLoading(false);
  };

  /**
   * Fetches current user's profile data
   * Redirects to login if unauthorized or on error
   */
  const fetchProfile = async () => {
    try {
      const data = await fetchWithAuth(`/profile`);
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      navigate('/login');
    }
  };

  // Handle Buy button click
  const handleBuy = async (product) => {
    const confirmed = window.confirm(
      `Do you really want to buy ${product.title}?`
    );
    if (!confirmed) return;
    try {
      const response = await fetchWithAuth(`/products/book`, {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
      // If fetchWithAuth throws, it will be caught below
      window.alert(`Purchase successful! Product key: ${response.productKey}`);
    } catch (error) {
      window.alert('Failed to complete purchase. Please try again later.');
    }
  };

  // Show loading state while fetching user data
  if (!user) {
    return (
      <div className="page loading-page">
        <div>Loading chat...</div>
      </div>
    );
  }

  /**
   * Main render
   * - Shows loading state or message list
   * - Includes chat input form
   */
  return (
    <>
      {/* Navbar at the very top of the page */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            {/* Conditionally render user avatar or default SVG icon */}
            {user.picture ? (
              <img src={user.picture} alt="Profile" className="avatar small" />
            ) : (
              <svg
                width="40"
                height="40"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="avatar small"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="#ddd"
                  stroke="#ccc"
                  strokeWidth="4"
                />
                <circle cx="50" cy="35" r="15" fill="#bbb" />
                <path d="M20 80c0-15 15-25 30-25s30 10 30 25" fill="#bbb" />
              </svg>
            )}
            <a href={`mailto:${user.email}`} className="user-link">
              {user.name}
            </a>
          </div>
          <button onClick={handleLogout} className="button logout-button">
            Logout
          </button>
        </div>
      </nav>
      {/* Main layout: chat and sidebar */}
      <div className="main-layout">
        <main className="chat-content" style={{ flex: 1 }}>
          {loading ? (
            <div>Loading messages...</div>
          ) : (
            <MessageList messages={messages} />
          )}
          <ChatInput onSend={handleSend} />
        </main>
        <aside
          className="sidebar-products"
          style={{
            width: 220,
            marginLeft: 8,
            minHeight: '100%',
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <h2
            style={{
              margin: '0 0 1rem 0',
              fontSize: '1.3rem',
              textAlign: 'center',
            }}
          >
            Products
          </h2>
          {productsLoading ? (
            <div>Loading products...</div>
          ) : productsError ? (
            <div style={{ color: 'red' }}>{productsError}</div>
          ) : products.length === 0 ? (
            <div>No products available.</div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="card product-card"
                style={{
                  textAlign: 'left',
                  padding: 8,
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  marginBottom: 0,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    marginBottom: 4,
                  }}
                >
                  {product.title}
                </div>
                <div
                  style={{
                    color: '#666',
                    fontSize: '0.97rem',
                    marginBottom: 8,
                  }}
                >
                  {product.description}
                </div>
                <div
                  style={{ fontWeight: 500, color: '#007bff', marginBottom: 8 }}
                >
                  ${(product.price / 100).toFixed(2)}
                </div>
                <button
                  className="button"
                  onClick={() => handleBuy(product)}
                  style={{ width: '100%' }}
                >
                  Buy
                </button>
              </div>
            ))
          )}
        </aside>
      </div>
    </>
  );
};

export default ChatPage;
