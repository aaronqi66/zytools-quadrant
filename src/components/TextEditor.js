import React, { useState, useEffect } from 'react';
import '../styles/TextEditor.css';

const TextEditor = ({ position, onSave, onCancel, initialContent, isEditing }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [isTodo, setIsTodo] = useState(false);
  
  // 如果是编辑模式，加载初始内容
  useEffect(() => {
    if (initialContent) {
      setText(initialContent.text.replace(/^□ /, '')); // 移除待办事项前缀
      setColor(initialContent.color || '#000000');
      setFontSize(parseInt(initialContent.fontSize) || 16);
      setIsTodo(initialContent.isTodo || initialContent.text.startsWith('□ '));
    }
  }, [initialContent]);
  
  const handleSave = () => {
    onSave({
      text: isTodo ? `□ ${text}` : text,
      color,
      fontSize: `${fontSize}px`,
      isTodo
    });
  };
  
  return (
    <div 
      className="text-editor"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入内容..."
        autoFocus
      />
      
      <div className="editor-controls">
        <div className="control-group">
          <label>颜色:</label>
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
          />
        </div>
        
        <div className="control-group">
          <label>字体大小:</label>
          <input 
            type="number" 
            value={fontSize} 
            min="8"
            max="72"
            onChange={(e) => setFontSize(parseInt(e.target.value))} 
          />
        </div>
        
        <div className="control-group">
          <label>
            <input 
              type="checkbox" 
              checked={isTodo} 
              onChange={(e) => setIsTodo(e.target.checked)} 
            />
            待办事项
          </label>
        </div>
        
        <div className="button-group">
          <button onClick={handleSave}>{isEditing ? '更新' : '保存'}</button>
          <button onClick={onCancel}>取消</button>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;