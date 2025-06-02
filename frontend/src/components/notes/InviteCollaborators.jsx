// /src/components/notes/InviteCollaborators.jsx
import React, { useState } from 'react';
import { shareNote } from '../../api/notes';

export const InviteCollaborators = ({ note, currentUser }) => {
  const [userIdToInvite, setUserIdToInvite] = useState('');
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    if (!userIdToInvite) {
      setMessage('Enter a user ID to invite.');
      return;
    }
    try {
      await shareNote(note._id, userIdToInvite);
      setMessage('User invited successfully!');
      setUserIdToInvite('');
    } catch (err) {
      setMessage('Failed to invite user: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!currentUser) return null; // only show if logged in

  return (
    <div>
      <input
        type="text"
        placeholder="User ID to invite"
        value={userIdToInvite}
        onChange={(e) => setUserIdToInvite(e.target.value)}
      />
      <button onClick={handleInvite}>Invite to collaborate</button>
      {message && <p>{message}</p>}
    </div>
  );
};
