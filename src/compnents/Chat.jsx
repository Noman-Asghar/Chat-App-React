import React, { useEffect, useState } from 'react';
import { auth, db } from '../Firebase';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;
    try {
      await addDoc(collection(db, 'messages'), {
        text: message,
        uid: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (
    <div className="container vh-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
        <h2>Chat</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>
      <div className="flex-grow-1 overflow-auto my-4" style={{ maxHeight: '70vh' }}>
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <div className={`p-2 rounded ${msg.uid === auth.currentUser.uid ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
              <p className="mb-0"><strong>{msg.uid === auth.currentUser.uid ? 'You' : msg.uid}</strong>: {msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Enter a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
