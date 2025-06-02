import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { ChatList } from './ChatList';
import { DocumentChat } from './DocumentChat';
import { CollabEditor } from '../editor/CollabEditor';
import { getChats, getNoteById } from '../../api/notes'; // Implement these API calls

export const MultiChatNote = ({ currentUser }) => {
  const socket = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  // Load all chats on mount
  useEffect(() => {
    async function fetchChats() {
      try {
        const data = await getChats(currentUser._id);
        setChats(data);
        if (data.length > 0) setSelectedChatId(data[0]._id);
      } catch (err) {
        console.error('Failed to load chats:', err);
      }
    }
    fetchChats();
  }, [currentUser._id]);

  // Load note for selected chat (assuming chat is linked to noteId)
  useEffect(() => {
    if (!selectedChatId) return;

    async function fetchNote() {
      try {
        const chat = chats.find(c => c._id === selectedChatId);
        if (!chat) return;

        // Assume chat has a noteId property that links to a note
        const noteId = chat.noteId;
        if (!noteId) return setSelectedNote(null);

        const note = await getNoteById(noteId);
        setSelectedNote(note);
      } catch (err) {
        console.error('Failed to load note for chat:', err);
      }
    }
    fetchNote();
  }, [selectedChatId, chats]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
        <ChatList chats={chats} onSelectChat={setSelectedChatId} currentUser={currentUser} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChatId ? (
          <>
            <div style={{ flex: 1, borderBottom: '1px solid #ddd', overflowY: 'auto' }}>
              <DocumentChat noteId={selectedChatId} currentUser={currentUser} socket={socket} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {selectedNote ? (
                <CollabEditor note={selectedNote} currentUser={currentUser} socket={socket} />
              ) : (
                <p style={{ padding: '1rem' }}>Select a chat with a linked note to edit</p>
              )}
            </div>
          </>
        ) : (
          <p style={{ padding: '1rem' }}>No chat selected</p>
        )}
      </div>

      <div style={{ width: '350px', borderLeft: '1px solid #ddd', padding: '1rem', background: '#f9f9f9' }}>
        {/* Optional: Additional info, collaborators list, etc. */}
      </div>
    </div>
  );
};
