export const ChatList = ({ chats, onSelectChat, currentUser }) => {
  return (
    <div className="chat-list">
      <h3>Your Chats</h3>
      <ul>
        {chats.map(chat => (
          <li 
            key={chat._id} 
            onClick={() => onSelectChat(chat._id)}
            className="chat-item"
          >
            {chat.isGroup ? chat.groupName : (
              chat.participants.find(p => p._id !== currentUser._id)?.username
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
