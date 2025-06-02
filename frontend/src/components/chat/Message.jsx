export const Message = ({ message, currentUser }) => {
  const isCurrentUser = message.sender._id === currentUser._id;
  
  return (
    <div className={`message ${isCurrentUser ? 'current-user' : ''}`}>
      {!isCurrentUser && (
        <div className="message-sender">{message.sender.username}</div>
      )}
      <div className="message-content">{message.content}</div>
      <div className="message-time">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};