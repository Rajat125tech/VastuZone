import React, { useState, useRef, useEffect } from 'react';
import '../styles/chatbot.css';

const FAQ_DATA = [
  {
    question: "How do I add a property?",
    answer: "To start an audit, go to your Dashboard and click 'Initiate New Audit' in the sidebar. You'll need to provide property details and upload a floor plan."
  },
  {
    question: "What is a Vastu Audit?",
    answer: "A Vastu Audit is a scientific analysis of your property's spatial geometry to ensure it aligns with natural energy flows for better prosperity and well-being."
  },
  {
    question: "How do I book an appointment?",
    answer: "You can book a 1:1 video consultation with Dr. Srivastava by clicking 'Book Premium Session' in the Consultation section."
  },
  {
    question: "Where are my reports?",
    answer: "Once an audit is processed, you can find your detailed PDF reports in the 'Analytical Reports' section of your Dashboard."
  },
  {
    question: "Can I talk to an expert?",
    answer: "Yes! Use the 'Expert Consultation' link in your dashboard to start a direct message thread with our lead consultants."
  }
];

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hello! I'm your VastuZone assistant. How can I help you navigate your spatial audit journey today?" }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionClick = (qa) => {
    setMessages(prev => [...prev, { type: 'user', text: qa.question }]);
    
    // Simulate bot thinking
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: qa.answer }]);
    }, 600);
  };

  return (
    <div className="chatbot-container">
      {/* TRIGGER BUTTON */}
      <button className="chatbot-trigger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Support Concierge</h3>
            <p>Automated Navigation Help</p>
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
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px' }}>Common Questions</p>
            {FAQ_DATA.map((qa, index) => (
              <button 
                key={index} 
                className="option-btn"
                onClick={() => handleOptionClick(qa)}
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
