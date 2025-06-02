import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getNoteById, updateNote, createNote } from '../../api/notes';
import { UserAvatar } from '../ui/UserAvatar';
import { Toolbar } from './Toolbar';

export const CollabEditor = ({ note, currentUser }) => {
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState(note._id || null);
  const quillRef = useRef(null);
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    if (!noteId) return;

    async function fetchNote() {
      try {
        const freshNote = await getNoteById(noteId);
        if (typeof freshNote.content === 'string') {
          const parsed = JSON.parse(freshNote.content);
          setContent({ ops: parsed });
        } else {
          setContent(freshNote.content || '');
        }
      } catch (error) {
        console.error('Failed to load note content:', error);
      }
    }

    fetchNote();
  }, [noteId]);

  useEffect(() => {
    setNoteId(note._id || null);

    if (typeof note.content === 'string') {
      try {
        const parsed = JSON.parse(note.content);
        setContent({ ops: parsed });
      } catch {
        setContent(note.content || '');
      }
    } else {
      setContent(note.content || '');
    }
  }, [note._id, note.content]);

  const handleFormat = (format) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (range) {
      editor.format(format, !editor.getFormat(range)[format]);
    }
  };

  const handleChange = async (contentValue, delta, source, editor) => {
    if (source !== 'user') return;

    const deltaContent = editor.getContents();
    setContent(deltaContent);

    try {
      const stringified = JSON.stringify(deltaContent.ops);

      if (!noteId) {
        const createdNote = await createNote({
          title: note.title || 'Untitled',
          content: stringified,
        });
        setNoteId(createdNote._id);
      } else {
        await updateNote(noteId, {
          content: stringified,
        });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>{note.title || 'Untitled'}</h2>
        <div className="collaborators">
          {collaborators.map((user) => (
            <UserAvatar key={user._id} user={user} />
          ))}
        </div>
      </div>

      <Toolbar onFormat={handleFormat} />

      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={handleChange}
        theme="snow"
        placeholder="Start collaborating..."
      />
    </div>
  );
};
