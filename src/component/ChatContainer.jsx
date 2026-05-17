import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, setCurrentUser, clearChat } from '../redux/chatSlice'
import io from 'socket.io-client';


function ChatContainer() {
    const [switchPage, setSwitchPage] = useState(true);
    const [userName, setUserName] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [socket, setSocket] = useState(null);
    const messages = useSelector(state => state.chatReducer.messages);
    const currentUser = useSelector(state => state.chatReducer.currentUser);
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            dispatch(setCurrentUser(savedUser));
            setSwitchPage(false);
            connectSocket(savedUser);
        }
    }, [dispatch]);

    const connectSocket = (user) => {

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://chat-socketio-backend-1.onrender.com';
        const newSocket = io(socketUrl, {
    transports: ["websocket"],
    withCredentials: true
})

        setSocket(newSocket);

        newSocket.on('message', (message) => {
            dispatch(sendMessage(message));
        });

        return () => newSocket.close();
    };

    const handleLogin = () => {
        if (!userName.trim()) {
            alert("Please enter user name");
            return;
        }

        localStorage.setItem("user", userName);
        dispatch(setCurrentUser(userName));
        setSwitchPage(false);
        connectSocket(userName);
    };

    const handleLogout = () => {
        if (socket) socket.disconnect();
        localStorage.removeItem("user");
        dispatch(setCurrentUser(null));
        setSwitchPage(true);
        setUserName('');
        dispatch(clearChat())
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !currentUser) return;

        const messageData = {
            id: Date.now(),
            text: messageInput,
            user: currentUser,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (socket) {
            socket.emit('message', messageData);
        }
        setMessageInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <>
            {switchPage ? (
                <div
                    className="d-flex align-items-center justify-content-center vh-100"
                    style={{
                        background: "linear-gradient(135deg, #0b141a 0%, #1f2c33 100%)",
                    }}
                >
                    <div
                        className="shadow-lg p-4 rounded"
                        style={{
                            width: "350px",
                            backgroundColor: "#202c33",
                        }}
                    >
                        <h3 className="text-center mb-4 text-success">Chat Login</h3>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="form-control mb-3 bg-dark text-light border-0 placeholder-light"
                            style={{
                                borderRadius: "10px",
                                padding: "10px",
                                color: "#ffffff",
                            }}
                        />
                        <button
                            onClick={handleLogin}
                            className="btn w-100"
                            style={{
                                backgroundColor: "#00a884",
                                color: "#fff",
                                borderRadius: "10px",
                                fontWeight: "bold",
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>

            ) : (
                <div
                    className="d-flex justify-content-center align-items-center vh-100"
                    style={{
                        backgroundColor: "#111b21",
                    }}
                >
                    <div
                        className="shadow-lg rounded d-flex flex-column"
                        style={{
                            height: "85vh",
                            width: "90%",
                            maxWidth: "900px",
                            backgroundColor: "#1f2c33",
                        }}
                    >
                        {/* Header */}
                        <header
                            className="text-white p-3 d-flex justify-content-between align-items-center"
                            style={{
                                backgroundColor: "#202c33",
                                borderBottom: "1px solid #2a3942",
                            }}
                        >
                            <div>
                                <strong>Chat App</strong>
                                <span className="ms-2 text-success">- {currentUser}</span>
                            </div>
                            <button
                                className="btn btn-sm"
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: "#2a3942",
                                    color: "#ff4d4d",
                                    border: "none",
                                }}
                            >
                                Logout
                            </button>
                        </header>

                        {/* Chat Body */}
                        <div
                            className="flex-grow-1 p-3"
                            style={{
                                overflowY: "auto",
                                backgroundColor: "#0b141a",
                                display: "flex",
                                flexDirection: "column",
                                scrollbarWidth: "thin",
                            }}
                        >
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`d-flex mb-2 ${message.user === currentUser
                                            ? "justify-content-end"
                                            : "justify-content-start"
                                        }`}
                                >
                                    <div
                                        className={`p-2 rounded-3 shadow-sm ${message.user === currentUser
                                                ? "bg-success text-white"
                                                : "bg-dark text-light"
                                            }`}
                                        style={{
                                            maxWidth: "70%",
                                            borderRadius: "12px",
                                            wordWrap: "break-word",
                                        }}
                                    >
                                        {message.user !== currentUser && (
                                            <small className="text-secondary d-block mb-1">
                                                {message.user}
                                            </small>
                                        )}
                                        <div>{message.text}</div>
                                        <div className="text-end">
                                            <small
                                                className={`${message.user === currentUser
                                                        ? "text-white-50"
                                                        : "text-secondary"
                                                    }`}
                                                style={{ fontSize: "0.75rem" }}
                                            >
                                                {message.timestamp}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer */}
                        <footer
                            className="p-3 d-flex align-items-center"
                            style={{
                                backgroundColor: "#202c33",
                                borderTop: "1px solid #2a3942",
                            }}
                        >
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="form-control border-0 text-light"
                                    style={{
                                        backgroundColor: "#2a3942",
                                        borderRadius: "20px",
                                        padding: "10px 15px",
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="btn ms-2"
                                    disabled={!messageInput.trim()}
                                    style={{
                                        backgroundColor: "#00a884",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        width: "45px",
                                        height: "45px",
                                    }}
                                >
                                    <i className="fa fa-paper-plane"></i>
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}

        </>
    );
}

export default ChatContainer;