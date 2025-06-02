export const UserAvatar = ({ user }) => {
  const initials = user.username.slice(0, 2).toUpperCase();
  return (
    <div className="user-avatar" title={user.username}>
      {initials}
    </div>
  );
};