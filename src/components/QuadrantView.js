import React, { useRef, useState, forwardRef, useEffect } from 'react';
import TextEditor from './TextEditor';
import '../styles/QuadrantView.css';

const QuadrantView = forwardRef(({ quadrantTitles, quadrantContents, onTitleChange, onAddContent }, ref) => {
  const [activeQuadrant, setActiveQuadrant] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
  const [editingItem, setEditingItem] = useState(null);
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const quadrantRef = useRef(null);
  
  // 处理容器点击 - 现在可以在任何地方点击添加内容
  const handleContainerClick = (e) => {
    // 如果点击的是内容项或编辑器，不处理
    if (e.target.closest('.content-item') || e.target.closest('.text-editor') || 
        e.target.closest('.axis-label')) {
      return;
    }
    
    // 确保 quadrantRef.current 存在，如果使用外部传入的ref，则使用它
    const currentRef = ref || quadrantRef;
    const containerRect = e.currentTarget.getBoundingClientRect();
    
    // 获取点击位置相对于容器的坐标
    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;
    
    // 确定点击的象限
    let quadrant;
    if (offsetX < containerRect.width / 2 && offsetY < containerRect.height / 2) {
      quadrant = 'A';
    } else if (offsetX >= containerRect.width / 2 && offsetY < containerRect.height / 2) {
      quadrant = 'B';
    } else if (offsetX >= containerRect.width / 2 && offsetY >= containerRect.height / 2) {
      quadrant = 'C';
    } else {
      quadrant = 'D';
    }
    
    setActiveQuadrant(quadrant);
    setEditingItem(null);
    
    setEditorPosition({
      x: offsetX,
      y: offsetY
    });
    setShowTextEditor(true);
  };
  
  // 处理标题编辑
  const handleTitleEdit = (position, e) => {
    onTitleChange(position, e.target.value);
  };
  
  // 添加新内容
  const handleAddContent = (content) => {
    if (activeQuadrant) {
      if (editingItem !== null) {
        // 编辑现有内容
        const updatedContents = [...quadrantContents[activeQuadrant]];
        updatedContents[editingItem] = {
          ...updatedContents[editingItem],
          text: content.text,
          color: content.color,
          fontSize: content.fontSize,
          isTodo: content.isTodo
        };
        onAddContent(activeQuadrant, updatedContents);
      } else {
        // 添加新内容
        onAddContent(activeQuadrant, {
          ...content,
          position: editorPosition
        });
      }
      setShowTextEditor(false);
      setEditingItem(null);
    }
  };
  
  // 处理内容项点击 - 编辑功能
  const handleContentItemClick = (quadrant, index, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    setActiveQuadrant(quadrant);
    setEditingItem(index);
    
    const item = quadrantContents[quadrant][index];
    setEditorPosition(item.position);
    setShowTextEditor(true);
  };
  
  // 处理内容项删除
  const handleContentItemDelete = (quadrant, index, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 创建新的内容数组，排除要删除的项
    const updatedContents = quadrantContents[quadrant].filter((_, i) => i !== index);
    
    // 调用父组件的更新方法
    onAddContent(quadrant, updatedContents);
  };
  
  // 开始拖动
  const handleDragStart = (quadrant, index, e) => {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation();
    
    // 如果点击的是删除按钮，不开始拖动
    if (e.target.closest('.delete-button')) {
      return;
    }
    
    const itemElement = e.currentTarget;
    const rect = itemElement.getBoundingClientRect();
    
    // 计算鼠标点击位置与元素左上角的偏移
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggingItem({ quadrant, index });
    setDragOffset({ x: offsetX, y: offsetY });
    
    // 添加拖动中的样式
    itemElement.classList.add('dragging');
  };
  
  // 拖动中
  const handleDrag = (e) => {
    if (!draggingItem) return;
    
    // 使用e.currentTarget代替quadrantRef.current，避免ref为null的问题
    const containerRect = document.querySelector('.quadrant-container').getBoundingClientRect();
    
    // 计算新位置，考虑拖动偏移
    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;
    
    // 限制在容器内
    newX = Math.max(0, Math.min(newX, containerRect.width - 100));
    newY = Math.max(0, Math.min(newY, containerRect.height - 50));
    
    // 确定当前位置所在的象限
    let newQuadrant;
    if (e.clientX < containerRect.left + containerRect.width / 2 && 
        e.clientY < containerRect.top + containerRect.height / 2) {
      newQuadrant = 'A';
    } else if (e.clientX >= containerRect.left + containerRect.width / 2 && 
               e.clientY < containerRect.top + containerRect.height / 2) {
      newQuadrant = 'B';
    } else if (e.clientX >= containerRect.left + containerRect.width / 2 && 
               e.clientY >= containerRect.top + containerRect.height / 2) {
      newQuadrant = 'C';
    } else {
      newQuadrant = 'D';
    }
    
    // 更新内容位置
    const { quadrant: oldQuadrant, index } = draggingItem;
    const item = quadrantContents[oldQuadrant][index];
    
    if (oldQuadrant === newQuadrant) {
      // 在同一象限内移动
      const updatedContents = [...quadrantContents[oldQuadrant]];
      updatedContents[index] = {
        ...item,
        position: { x: newX, y: newY }
      };
      onAddContent(oldQuadrant, updatedContents);
    } else {
      // 跨象限移动
      // 从原象限移除
      const oldQuadrantContents = quadrantContents[oldQuadrant].filter((_, i) => i !== index);
      
      // 添加到新象限
      const newQuadrantContents = [
        ...quadrantContents[newQuadrant],
        {
          ...item,
          position: { x: newX, y: newY }
        }
      ];
      
      // 更新两个象限
      onAddContent(oldQuadrant, oldQuadrantContents);
      onAddContent(newQuadrant, newQuadrantContents);
      
      // 更新拖动项信息
      setDraggingItem({ quadrant: newQuadrant, index: newQuadrantContents.length - 1 });
    }
  };
  
  // 结束拖动
  const handleDragEnd = () => {
    if (!draggingItem) return;
    
    // 移除拖动中的样式
    const items = document.querySelectorAll('.content-item');
    items.forEach(item => item.classList.remove('dragging'));
    
    setDraggingItem(null);
  };
  
  // 添加鼠标移动和鼠标抬起的事件监听
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggingItem) {
        handleDrag(e);
      }
    };
    
    const handleMouseUp = () => {
      if (draggingItem) {
        handleDragEnd();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItem, dragOffset, quadrantContents]); // 添加quadrantContents作为依赖项
  
  return (
    <div className="quadrant-container" ref={ref || quadrantRef} onClick={handleContainerClick}>
      {/* 坐标轴 */}
      <div className="axis x-axis">
        <div className="arrow-right"></div>
      </div>
      <div className="axis y-axis">
        <div className="arrow-up"></div>
      </div>
      
      {/* 坐标轴标签 - 现在放在外侧 */}
      <textarea 
        className="axis-label x1-outer" 
        value={quadrantTitles.x1} 
        onChange={(e) => handleTitleEdit('x1', e)}
        maxLength={12}
        onClick={(e) => e.stopPropagation()}
      />
      <textarea 
        className="axis-label x2-outer" 
        value={quadrantTitles.x2} 
        onChange={(e) => handleTitleEdit('x2', e)}
        maxLength={12}
        onClick={(e) => e.stopPropagation()}
      />
      <textarea 
        className="axis-label y1-outer" 
        value={quadrantTitles.y1} 
        onChange={(e) => handleTitleEdit('y1', e)}
        maxLength={12}
        onClick={(e) => e.stopPropagation()}
      />
      <textarea 
        className="axis-label y2-outer" 
        value={quadrantTitles.y2} 
        onChange={(e) => handleTitleEdit('y2', e)}
        maxLength={12}
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* 四个象限 - 不再需要单独的点击处理 */}
      <div className="quadrant A">
        {quadrantContents.A.map((item, index) => (
          <div 
            key={`A-${index}`}
            className="content-item"
            style={{
              left: item.position.x,
              top: item.position.y,
              color: item.color,
              fontSize: item.fontSize
            }}
            onMouseDown={(e) => handleDragStart('A', index, e)}
            onDoubleClick={(e) => handleContentItemClick('A', index, e)}
          >
            {item.text}
            <button 
              className="delete-button" 
              onClick={(e) => handleContentItemDelete('A', index, e)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="quadrant B">
        {quadrantContents.B.map((item, index) => (
          <div 
            key={`B-${index}`}
            className="content-item"
            style={{
              left: item.position.x,
              top: item.position.y,
              color: item.color,
              fontSize: item.fontSize
            }}
            onMouseDown={(e) => handleDragStart('B', index, e)}
            onDoubleClick={(e) => handleContentItemClick('B', index, e)}
          >
            {item.text}
            <button 
              className="delete-button" 
              onClick={(e) => handleContentItemDelete('B', index, e)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="quadrant C">
        {quadrantContents.C.map((item, index) => (
          <div 
            key={`C-${index}`}
            className="content-item"
            style={{
              left: item.position.x,
              top: item.position.y,
              color: item.color,
              fontSize: item.fontSize
            }}
            onMouseDown={(e) => handleDragStart('C', index, e)}
            onDoubleClick={(e) => handleContentItemClick('C', index, e)}
          >
            {item.text}
            <button 
              className="delete-button" 
              onClick={(e) => handleContentItemDelete('C', index, e)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="quadrant D">
        {quadrantContents.D.map((item, index) => (
          <div 
            key={`D-${index}`}
            className="content-item"
            style={{
              left: item.position.x,
              top: item.position.y,
              color: item.color,
              fontSize: item.fontSize
            }}
            onMouseDown={(e) => handleDragStart('D', index, e)}
            onDoubleClick={(e) => handleContentItemClick('D', index, e)}
          >
            {item.text}
            <button 
              className="delete-button" 
              onClick={(e) => handleContentItemDelete('D', index, e)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {/* 文本编辑器 */}
      {showTextEditor && (
        <TextEditor 
          position={editorPosition}
          onSave={handleAddContent}
          onCancel={() => {
            setShowTextEditor(false);
            setEditingItem(null);
          }}
          initialContent={editingItem !== null ? quadrantContents[activeQuadrant][editingItem] : null}
          isEditing={editingItem !== null}
        />
      )}
    </div>
  );
});

export default QuadrantView;