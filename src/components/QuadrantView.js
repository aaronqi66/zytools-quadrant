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
  
  // 处理容器点击 - 现在改为双击添加内容
  const handleContainerDoubleClick = (e) => {
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
    
    // 如果点击的是待办事项的复选框，切换完成状态
    if (e.target.type === 'checkbox') {
      const updatedContents = [...quadrantContents[quadrant]];
      const item = updatedContents[index];
      const isCompleted = item.text.startsWith('☑ ');
      updatedContents[index] = {
        ...item,
        text: isCompleted ? `□ ${item.text.slice(2)}` : `☑ ${item.text.slice(2)}`
      };
      onAddContent(quadrant, updatedContents);
      return;
    }
  };
  
  // 处理内容项双击 - 编辑功能
  const handleContentItemDoubleClick = (quadrant, index, e) => {
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
  
  // 添加事件处理
  useEffect(() => {
    const handleMove = (e) => {
      if (draggingItem) {
        handleDrag(e);
      }
    };

    const handleEnd = () => {
      if (draggingItem) {
        handleDragEnd();
      }
    };

    // 添加鼠标事件
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // 添加触摸事件
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      // 移除鼠标事件
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);

      // 移除触摸事件
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [draggingItem, dragOffset, quadrantContents]);
  
  // 处理拖动
  const handleDrag = (e) => {
    if (!draggingItem) return;
    
    // 获取触摸或鼠标事件的位置
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // 获取容器和象限的边界
    const containerRect = document.querySelector('.quadrant-container').getBoundingClientRect();
    const itemWidth = 100; // 可根据实际内容宽度调整
    const itemHeight = 50; // 可根据实际内容高度调整

    // 计算新位置，考虑拖动偏移
    let newX = clientX - containerRect.left - dragOffset.x;
    let newY = clientY - containerRect.top - dragOffset.y;

    // 计算象限边界
    const quadrantRects = {
      A: { left: 0, top: 0, width: containerRect.width / 2, height: containerRect.height / 2 },
      B: { left: containerRect.width / 2, top: 0, width: containerRect.width / 2, height: containerRect.height / 2 },
      C: { left: containerRect.width / 2, top: containerRect.height / 2, width: containerRect.width / 2, height: containerRect.height / 2 },
      D: { left: 0, top: containerRect.height / 2, width: containerRect.width / 2, height: containerRect.height / 2 }
    };
    // 确定当前位置所在的象限
    let newQuadrant;
    if (clientX < containerRect.left + containerRect.width / 2 && 
        clientY < containerRect.top + containerRect.height / 2) {
      newQuadrant = 'A';
    } else if (clientX >= containerRect.left + containerRect.width / 2 && 
               clientY < containerRect.top + containerRect.height / 2) {
      newQuadrant = 'B';
    } else if (clientX >= containerRect.left + containerRect.width / 2 && 
               clientY >= containerRect.top + containerRect.height / 2) {
      newQuadrant = 'C';
    } else {
      newQuadrant = 'D';
    }
    const rect = quadrantRects[newQuadrant];
    // 限制在象限内
    newX = Math.max(rect.left, Math.min(newX, rect.left + rect.width - itemWidth));
    newY = Math.max(rect.top, Math.min(newY, rect.top + rect.height - itemHeight));

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
    
    // 获取触摸或鼠标事件的位置
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // 计算鼠标点击位置与元素左上角的偏移
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
    
    setDraggingItem({ quadrant, index });
    setDragOffset({ x: offsetX, y: offsetY });
    
    // 添加拖动中的样式
    itemElement.classList.add('dragging');
  };
  
  // 结束拖动
  const handleDragEnd = () => {
    if (!draggingItem) return;
    
    // 移除拖动中的样式
    const items = document.querySelectorAll('.content-item');
    items.forEach(item => item.classList.remove('dragging'));
    
    setDraggingItem(null);
  };
  
  // 渲染内容项
  const renderContentItem = (item, quadrant, index) => {
    const isTodo = item.text.startsWith('□ ') || item.text.startsWith('☑ ');
    const isCompleted = item.text.startsWith('☑ ');
    const displayText = isTodo ? item.text.slice(2) : item.text;
    
    return (
      <div
        key={index}
        className={`content-item ${isTodo ? 'todo-item' : ''} ${isCompleted ? 'completed' : ''}`}
        style={{
          left: item.position.x,
          top: item.position.y,
          color: item.color,
          fontSize: item.fontSize
        }}
        onClick={(e) => handleContentItemClick(quadrant, index, e)}
        onDoubleClick={(e) => handleContentItemDoubleClick(quadrant, index, e)}
        onMouseDown={(e) => handleDragStart(quadrant, index, e)}
        onTouchStart={(e) => handleDragStart(quadrant, index, e)}
      >
        {isTodo && (
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => handleContentItemClick(quadrant, index, e)}
            className="todo-checkbox"
          />
        )}
        <span className="content-text">{displayText}</span>
        <button 
          className="delete-button"
          onClick={(e) => handleContentItemDelete(quadrant, index, e)}
        >
          ×
        </button>
      </div>
    );
  };
  
  return (
    <div className="quadrant-container" ref={ref || quadrantRef} onDoubleClick={handleContainerDoubleClick}>
      {/* 坐标轴标签 */}
      <div className="axis-labels">
        <textarea 
          className="x1-outer"
          value={quadrantTitles.x1}
          onChange={(e) => handleTitleEdit('x1', e)}
          placeholder="输入标签..."
        />
        <textarea 
          className="x2-outer"
          value={quadrantTitles.x2}
          onChange={(e) => handleTitleEdit('x2', e)}
          placeholder="输入标签..."
        />
        <textarea 
          className="y1-outer"
          value={quadrantTitles.y1}
          onChange={(e) => handleTitleEdit('y1', e)}
          placeholder="输入标签..."
        />
        <textarea 
          className="y2-outer"
          value={quadrantTitles.y2}
          onChange={(e) => handleTitleEdit('y2', e)}
          placeholder="输入标签..."
        />
      </div>
      {/* 象限分割线，仅做视觉分割 */}
      <div className="quadrant-lines">
        <div className="before-arrow-up"></div>
        <div className="after-arrow-right"></div>
      </div>
      {/* 渲染所有内容项 */}
      {['A','B','C','D'].flatMap(q =>
        quadrantContents[q].map((item, idx) => renderContentItem(item, q, idx))
      )}
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