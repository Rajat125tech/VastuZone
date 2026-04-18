import React, { useState, useRef, useEffect } from 'react';
import '../styles/chatbot.css';

const FAQ_DATA = [
  {
    question: "🚀 Start App Tour",
    answer: "Welcome! Here is the end-to-end flow: 1. Go to 'Portfolio Overview' -> 2. Click 'Initiate New Audit' to add property -> 3. Our AI generates a baseline analysis -> 4. Consult an Expert for a final scientific audit."
  },
  {
    question: "How do I add a property?",
    answer: "Navigate to your Dashboard and select 'Initiate New Audit' from the management sidebar to submit your architectural details."
  },
  {
    question: "What is a Vastu Audit?",
    answer: "It is a scientific evaluation of your property's geometric alignment with natural energy fields to optimize prosperity."
  },
  {
    question: "Where are my reports?",
    answer: "Processed audits are stored in the 'View All Reports' section, available for high-resolution download."
  }
];

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCTA, setShowCTA] = useState(true);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Welcome to VastuZone. I am your automated navigation assistant. How may I guide you today?" }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setShowCTA(false), 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleOptionClick = (qa) => {
    setMessages(prev => [...prev, { type: 'user', text: qa.question }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: qa.answer }]);
    }, 600);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowCTA(false);
  };

  return (
    <div className="chatbot-container">
      {showCTA && !isOpen && (
        <div className="chatbot-cta">
          How can I help you? 👋
        </div>
      )}

      {/* RESTORED BUTTON STYLE */}
      <button className="chatbot-trigger" onClick={toggleChat}>
        {isOpen ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Close Help
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Ask for Help
          </>
        )}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Support Concierge</h3>
            <p>VastuZone Navigation Assistant</p>
          </div>

          <div className="chatbot-content">
            {messages.map((msg, index) => (
              <div key={index} className={msg.type === 'bot' ? 'bot-msg' : 'user-msg'}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="chatbot-options">
            {FAQ_DATA.map((qa, index) => (
              <button 
                key={index} 
                className="option-btn"
                onClick={() => handleOptionClick(qa)}
                style={index === 0 ? { background: 'var(--ink)', color: 'var(--paper)' } : {}}
              >
                {qa.question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChatbot;
