import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, User, X } from 'lucide-react';
import { getSearchResults } from '../../../services/api';

// Auto-resizing textarea component
const AutoResizeTextarea = ({ value, onChange, onKeyPress, placeholder, onInput }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      onInput={onInput}
      placeholder={placeholder}
      rows={1}
    />
  );
};

export default function AIChat() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your meeting assistant. I can help you manage your calendar, create events, or answer questions about your schedule.", 
      sender: 'ai' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  const suggestions = [
    "Schedule a meeting with my team",
    "What meetings do I have tomorrow?",
    "Cancel my 3pm meeting",
    "Find a time when Alex is available"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { id: messages.length + 1, text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    
    // Show AI is typing
    setIsTyping(true);
    
    // Simulate AI response (would connect to backend API in production)
    setTimeout(() => {
      const aiMessage = { 
        id: messages.length + 2, 
        text: generateDemoResponse(input), 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateDemoResponse = (userInput) => {
    const userQuestion = userInput.toLowerCase();
    if (userQuestion.includes('create meeting') || userQuestion.includes('schedule')) {
      return "I'd be happy to help you schedule a meeting. In a real implementation, I would ask for details like the title, date, time, and attendees. Would you like to go to the Calendar tab to create an event now?";
    } else if (userQuestion.includes('cancel')) {
      return "I can help you cancel a meeting. In a fully implemented version, I'd show you your upcoming meetings and let you select which one to cancel.";
    } else if (userQuestion.includes('upcoming') || userQuestion.includes('next meeting')) {
      return "You have a demo meeting with the team tomorrow at 3pm. In a complete implementation, I would fetch this information from your calendar.";
    } else {
      return "I understand you're asking about: '" + userInput + "'. In a fully implemented version, I would connect to your calendar data and provide relevant information or actions.";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isSearching) {
        // If we're in search mode and Enter is pressed, do nothing
        return;
      }
      handleSend();
    }
  };

  const handleInputChange = async (e) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    // Get cursor position
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    // Check for hashtag trigger
    const triggerIndex = newValue.lastIndexOf('#', cursorPos);
    
    if (triggerIndex !== -1 && (triggerIndex === 0 || newValue[triggerIndex - 1] === ' ')) {
      // Extract search query (text between # and cursor)
      const query = newValue.substring(triggerIndex + 1, cursorPos);
      setSearchQuery(query);
      
      if (query.length > 0) {
        // Search for users
        setIsSearching(true);
        try {
          const results = await getSearchResults(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        }
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    } else {
      // No search trigger, reset search state
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleUserSelect = (user) => {
    // Get the last hashtag position
    const triggerIndex = input.lastIndexOf('#', cursorPosition);
    
    if (triggerIndex !== -1) {
      // Replace the query (text between # and cursor) with selected user info
      const beforeTag = input.substring(0, triggerIndex);
      const afterCursor = input.substring(cursorPosition);
      
      // Insert user mention
      const newValue = `${beforeTag}@${user.name}${afterCursor}`;
      setInput(newValue);
      
      // Calculate new cursor position (after the inserted user mention)
      const newCursorPos = triggerIndex + user.name.length + 1; // +1 for @ symbol
      
      // Close search results
      setIsSearching(false);
      setSearchResults([]);
      
      // Focus and set cursor position - needs to be done after state update
      setTimeout(() => {
        const textarea = document.querySelector('.input-container textarea');
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const closeSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  // Reset suggestions when chat is cleared
  const clearChat = () => {
    setMessages([
      { 
        id: 1, 
        text: "Hello! I'm your meeting assistant. I can help you manage your calendar, create events, or answer questions about your schedule.", 
        sender: 'ai' 
      }
    ]);
    setShowSuggestions(true);
  };

  // Hide suggestions after first user message
  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].sender === 'user') {
      setShowSuggestions(false);
    }
  }, [messages]);

  // Format message text to highlight mentions
  const formatMessageText = (text) => {
    if (!text.includes('@')) return text;
    
    // Split by @ symbol
    const parts = text.split(/(@[a-zA-Z\s]+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        // This is a mention, style it differently
        return <span key={index} className="user-mention">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <h2>AI Calendar Assistant</h2>
        <button className="clear-chat" onClick={clearChat} title="Clear chat">
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-bubble">
              {formatMessageText(message.text)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message ai">
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        
        {showSuggestions && (
          <div className="suggestions-container">
            <div className="suggestions-label">Try asking:</div>
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  className="suggestion-button"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <AutoResizeTextarea
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your schedule or create a meeting... (Type # to mention users)"
          ref={textareaRef}
        />
        <button 
          className="send-button" 
          onClick={handleSend}
          disabled={input.trim() === '' || isSearching}
        >
          <Send size={20} />
        </button>
        
        {/* User search results dropdown */}
        {isSearching && (
          <div className="user-search-dropdown">
            <div className="user-search-header">
              <span>Users matching "{searchQuery}"</span>
              <button className="close-search" onClick={closeSearch}>
                <X size={16} />
              </button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="user-search-results">
                {searchResults.map(user => (
                  <div 
                    key={user.id} 
                    className="user-search-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar-small">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 