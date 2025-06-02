import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getNoteById } from '../api/notes';
import { getChats, getChatById } from '../api/chat';
import { CollabEditor } from './editor/CollabEditor';
import { DocumentChat } from './chat/DocumentChat';
import { ChatList } from './chat/ChatList';
import '../styles/workspace.css';

export const DocumentWorkspace = () => {
  const { id: noteId } = useParams();
  const { user: currentUser } = useAuthStore();

  const [note, setNote] = useState(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [errorNote, setErrorNote] = useState(null);

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorChats, setErrorChats] = useState(null);

  const [activeChat, setActiveChat] = useState(null);
  const [loadingActiveChat, setLoadingActiveChat] = useState(false);
  const [errorActiveChat, setErrorActiveChat] = useState(null);

  // Load note
  useEffect(() => {
    if (!noteId) return;
    setLoadingNote(true);
    getNoteById(noteId)
      .then(data => {
        if (!data || !data._id) {
          throw new Error('Note not found or invalid format');
        }

        // Ensure content field is not undefined
        if (!data.content) {
          data.content = ''; // Default to empty string
        }

        console.log('Loaded note:', data); // ✅ Debug
        setNote(data);
        setErrorNote(null);
      })
      .catch(err => {
        console.error('Failed to load note:', err); // ✅ Debug
        setErrorNote(err.message || 'Failed to load note');
      })
      .finally(() => setLoadingNote(false));
  }, [noteId]);

  // Load all chats
  useEffect(() => {
    if (!currentUser) return;
    setLoadingChats(true);
    getChats()
      .then(data => {
        setChats(Array.isArray(data) ? data : []);
        setErrorChats(null);
      })
      .catch(err => setErrorChats(err.message || 'Failed to load chats'))
      .finally(() => setLoadingChats(false));
  }, [currentUser]);

  // Load selected chat
  useEffect(() => {
    if (!activeChat?.id && !activeChat?._id) return;
    const chatId = activeChat.id || activeChat._id;
    setLoadingActiveChat(true);
    getChatById(chatId)
      .then(data => {
        setActiveChat(data);
        setErrorActiveChat(null);
      })
      .catch(err => setErrorActiveChat(err.message || 'Failed to load chat'))
      .finally(() => setLoadingActiveChat(false));
  }, [activeChat?.id, activeChat?._id]);

  // UI rendering
  if (loadingNote) return <div className="loading">Loading document...</div>;
  if (errorNote) return <div className="error">{errorNote}</div>;
  if (!note) return <div className="error">Document not found</div>;

  return (
    <div className="workspace-container">
      <div className="sidebar">
        {loadingChats && <div>Loading chats...</div>}
        {errorChats && <div className="error">{errorChats}</div>}
        {!loadingChats && !errorChats && (
          <ChatList
            chats={chats}
            currentUser={currentUser}
            onSelectChat={setActiveChat}
            activeChatId={activeChat?._id || activeChat?.id}
          />
        )}
      </div>

      <div className="document-area">
        {note ? (
          <CollabEditor note={note} currentUser={currentUser} />
        ) : (
          <div className="error">No note data to display.</div>
        )}
      </div>

      <div className="chat-area">
        {activeChat ? (
          loadingActiveChat ? (
            <div>Loading chat...</div>
          ) : errorActiveChat ? (
            <div className="error">{errorActiveChat}</div>
          ) : (
            <DocumentChat
              noteId={note._id}
              currentUser={currentUser}
              chat={activeChat}
            />
          )
        ) : (
          <div className="chat-placeholder">Select a chat from the sidebar</div>
        )}
      </div>
    </div>
  );
};
