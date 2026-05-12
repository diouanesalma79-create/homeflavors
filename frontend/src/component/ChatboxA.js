import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style/ChatboxA.css';

const ChatboxA = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your AI recipe assistant. Enter some ingredients or ask me about a dish, and I'll help you cook something delicious!", 
      sender: 'ai' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    // Only scroll if we have more than the initial greeting message
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    if (inputValue.trim() === '') {
      setError("Please enter some ingredients or a question.");
      return;
    }

    setError(null);
    const userMessageText = inputValue;
    
    // Add user message to UI
    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userMessageText })
      });

      const result = await response.json();

      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          recipeData: result.data // Store structured data
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: result.message || "Something went wrong.",
          sender: 'ai',
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Connection failed. Please ensure the server is running.",
        sender: 'ai',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message) => {
    if (message.recipeData) {
      const { recipe, ingredients, steps, tips } = message.recipeData;
      return (
        <div className="recipe-response">
          <h2 className="recipe-title">{recipe}</h2>
          
          <div className="recipe-section">
            <h3>Ingredients</h3>
            <ul>
              {ingredients && ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>

          <div className="recipe-section">
            <h3>Preparation Steps</h3>
            <ol>
              {steps && steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {tips && (
            <div className="recipe-tips">
              <strong>Chef's Tips:</strong> {tips}
            </div>
          )}
        </div>
      );
    }

    return <div className={message.isError ? "error-text" : ""}>{message.text}</div>;
  };

  return (
    <div className="chatbox-wrapper">
      <header className="chat-header">
        <div className="header-content">
          <div className="header-info">
            <h1>AI Recipe Assistant</h1>
            <p>Your personal digital chef</p>
          </div>
          <Link to="/" className="back-to-home-btn">Back to Home</Link>
        </div>
      </header>

      <main className="chat-content">
        <div className="messages-list">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message-row ${message.sender}-row`}
            >
              <div className={`chat-bubble ${message.sender}-bubble ${message.recipeData ? 'recipe-bubble' : ''}`}>
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-row ai-row">
              <div className="chat-bubble ai-bubble loading-bubble">
                <span className="cooking-text">AI is cooking...</span>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="chat-input-container">
        <div className="input-wrapper">
          {error && <div className="input-tooltip">{error}</div>}
          <form className="input-group" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., 'Chicken, rice, garlic' or 'How to make pasta?'"
              className="chat-input"
              disabled={isLoading}
            />
            <button 
              type="button"
              onClick={handleSendMessage} 
              className="chat-send-btn"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? <div className="spinner"></div> : 'Send'}
            </button>
          </form>
          <div className="input-suggestions">
            <button onClick={() => setInputValue('Quick 15-min dinner')}>Quick Dinner</button>
            <button onClick={() => setInputValue('Healthy vegan lunch')}>Vegan Lunch</button>
            <button onClick={() => setInputValue('Dessert with chocolate')}>Chocolate Dessert</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatboxA;