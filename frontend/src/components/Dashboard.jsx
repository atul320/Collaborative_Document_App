import { useEffect, useState } from 'react';
import { getNotes } from '../api/notes';
import { Link } from 'react-router-dom';
import { CollabEditor } from './editor/CollabEditor';
import { useAuthStore } from '../stores/authStore';
import { Chat } from './Chat';

export const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    getNotes()
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(data);
        } else if (data && Array.isArray(data.notes)) {
          setNotes(data.notes);
        } else {
          console.warn('Unexpected notes data format:', data);
          setNotes([]);
        }
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading notes:', err);
        setError(err.message || 'Failed to load notes');
        setNotes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '1rem', display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <h2>Your Documents</h2>

        {loading && <div>Loading your documents...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && notes.length === 0 && (
          <div>No documents found.</div>
        )}

        {!loading && !error && notes.length > 0 && (
          <ul>
            {notes.map((note) => (
              <li key={note._id}>
                <Link to={`/documents/${note._id}`}>{note.title}</Link>
              </li>
            ))}
          </ul>
        )}

        <hr />

        <h3>Editor</h3>

        <CollabEditor
          note={notes[0] || { title: 'Untitled', content: '' }} // always send something
          currentUser={currentUser}
        />
      </div>

      {/* Chat sidebar */}
      <aside style={{ width: 350, borderLeft: '1px solid #ddd', paddingLeft: 20 }}>
        <Chat />
      </aside>
    </div>
  );
};
