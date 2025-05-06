import React, { useState, useRef, useEffect } from "react";
import "./ChatbotModal.css";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";

const ChatbotModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Merhaba! Ben Yapay Ders asistanınızım. Fizik konularında sorularınızı yanıtlayabilirim.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // Kullanıcı mesajını ekle
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // API yolunun düzeltilmesi gerekiyor (HTTP yerine HTTPS olabilir, projenize göre ayarlayın)
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: inputText }),
      });

      if (!response.ok) {
        throw new Error("API yanıt vermedi");
      }

      const data = await response.json();

      // Bot cevabını ekle
      const botResponse = {
        id: messages.length + 2,
        text: data.response || data.error || "Bir cevap alınamadı.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Hata:", error);

      // Hata mesajı ekle
      const errorMessage = {
        id: messages.length + 2,
        text: "Üzgünüm, sunucuya bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaRobot /> <span>Yapay Ders Asistanı</span>
            </div>
            <button className="close-button" onClick={toggleModal}>
              <FaTimes />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                <div className="message-bubble">
                  <div className="message-text">{message.text}</div>
                  <div className="message-timestamp">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-bubble loading-bubble">
                  <BiLoaderAlt className="loading-icon" />
                  <span>Yanıt hazırlanıyor...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Fizik ile ilgili bir soru sorun..."
              disabled={isLoading}
            />
            <button type="submit" disabled={!inputText.trim() || isLoading}>
              {isLoading ? <BiLoaderAlt className="spin" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
      )}
      <button
        className={`chatbot-toggle-button ${isOpen ? "active" : ""}`}
        onClick={toggleModal}
      >
        <FaRobot />
        <span>{isOpen ? "Kapat" : "Soru Sor"}</span>
      </button>
    </div>
  );
};

export default ChatbotModal;
