import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Card, Badge, InputGroup } from 'react-bootstrap';
import { FaRobot, FaPaperPlane, FaTimes, FaUser } from 'react-icons/fa';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm ElectroBot. How can I help you with electronics today?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        // Add user message
        const userMessage = {
            text: message,
            isUser: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        const currentMessage = message;
        setMessage('');
        setLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "I can help you compare smartphones, laptops, and other electronics!",
                "Check out our product comparison tool for detailed specs.",
                "We have great deals on smartphones this week!",
                "For programming, I recommend laptops with at least 16GB RAM."
            ];

            const botMessage = {
                text: responses[Math.floor(Math.random() * responses.length)],
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
            setLoading(false);
        }, 1000);
    };

    return (
        <>
            {/* Chat button */}
            {!isOpen && (
                <Button
                    variant="primary"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        fontSize: '24px'
                    }}
                    onClick={() => setIsOpen(true)}
                >
                    <FaRobot />
                </Button>
            )}

            {/* Chat window */}
            {isOpen && (
                <Card
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '350px',
                        height: '500px',
                        zIndex: 1000
                    }}
                >
                    <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                        <div>
                            <FaRobot className="me-2" />
                            <strong>SmartKart AI Assistant</strong>
                        </div>
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes />
                        </Button>
                    </Card.Header>

                    <Card.Body
                        style={{
                            overflowY: 'auto',
                            height: '350px',
                            padding: '10px'
                        }}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-3 ${msg.isUser ? 'text-end' : 'text-start'}`}
                            >
                                <Badge
                                    bg={msg.isUser ? 'primary' : 'secondary'}
                                    className="p-2"
                                    style={{ maxWidth: '80%', display: 'inline-block' }}
                                >
                                    {msg.text}
                                </Badge>
                                <div className="text-muted small mt-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="text-center">
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span className="ms-2">Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </Card.Body>

                    <Card.Footer>
                        <div className="d-flex">
                            <Form.Control
                                type="text"
                                placeholder="Ask about electronics..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={loading}
                            />
                            <Button
                                variant="primary"
                                onClick={handleSendMessage}
                                disabled={loading || !message.trim()}
                                className="ms-2"
                            >
                                <FaPaperPlane />
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
            )}
        </>
    );
};

export default ChatBot;