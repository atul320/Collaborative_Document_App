export const Toolbar = ({ onFormat }) => {
  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'header', 'list', 'bullet', 'link',
    'color', 'background', 'clean'
  ];

  return (
    <div className="toolbar">
      {formats.map(format => (
        <button 
          key={format}
          onClick={() => onFormat(format)}
          className={`toolbar-button ${format}`}
        >
          {format}
        </button>
      ))}
    </div>
  );
};