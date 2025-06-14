import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import QuadrantView from './components/QuadrantView';
import './styles/App.css';

function App() {
  const quadrantRef = useRef(null);
  // 四个象限的标题
  const [quadrantTitles, setQuadrantTitles] = useState({
    x1: '1',
    x2: '2', 
    y1: '3',
    y2: '4'
  });
  
  // 四个象限的内容
  const [quadrantContents, setQuadrantContents] = useState({
    A: [],
    B: [],
    C: [],
    D: []
  });
  
  // 更新象限标题
  const updateQuadrantTitle = (position, newTitle) => {
    setQuadrantTitles(prev => ({
      ...prev,
      [position]: newTitle
    }));
  };
  
  // 添加内容到象限
  const addContentToQuadrant = (quadrant, content) => {
    console.log('添加内容到象限:', quadrant, content); // 添加日志调试
    
    // 如果传入的是数组，则直接替换整个象限内容
    if (Array.isArray(content)) {
      setQuadrantContents(prev => ({
        ...prev,
        [quadrant]: content
      }));
    } else {
      // 否则添加单个内容
      setQuadrantContents(prev => ({
        ...prev,
        [quadrant]: [...prev[quadrant], content]
      }));
    }
  };
  
  // 导出为图片
  // 导出为图片 - 替代方案
  // 导出为图片 - 使用domtoimage库
  const exportAsImage = () => {
    if (quadrantRef.current) {
      // 保存原始标签内容
      const labelTexts = {
        x1: document.querySelector('.x1-outer').value,
        x2: document.querySelector('.x2-outer').value,
        y1: document.querySelector('.y1-outer').value,
        y2: document.querySelector('.y2-outer').value
      };
      
      // 获取原始四象限视图的尺寸
      const originalRect = quadrantRef.current.getBoundingClientRect();
      const width = originalRect.width;
      const height = originalRect.height;
      
      // 创建一个新的容器用于导出
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'relative';
      exportContainer.style.width = `${width + 200}px`; // 增加宽度以容纳左右标签
      exportContainer.style.height = `${height + 200}px`; // 增加高度以容纳上下标签
      exportContainer.style.backgroundColor = '#ffffff'; // 白色背景
      exportContainer.style.padding = '0';
      
      // 克隆四象限视图
      const clone = quadrantRef.current.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.top = '100px';
      clone.style.left = '100px';
      exportContainer.appendChild(clone);
      
      // 移除原始标签
      const textareas = clone.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        textarea.parentNode.removeChild(textarea);
      });
      
      // 添加标签 - 改进换行处理
      const leftLabel = document.createElement('div');
      leftLabel.textContent = labelTexts.x1;
      leftLabel.style.position = 'absolute';
      leftLabel.style.left = '10px';
      leftLabel.style.top = `${100 + height/2}px`;
      leftLabel.style.color = '#222222'; // 深色文字
      leftLabel.style.fontSize = '18px';
      leftLabel.style.fontWeight = '500';
      leftLabel.style.textAlign = 'center';
      leftLabel.style.width = '80px';
      leftLabel.style.wordWrap = 'break-word';
      leftLabel.style.whiteSpace = 'pre-wrap';
      leftLabel.style.lineHeight = '1.2';
      leftLabel.style.transform = 'translateY(-50%)';
      exportContainer.appendChild(leftLabel);
      
      const rightLabel = document.createElement('div');
      rightLabel.textContent = labelTexts.x2;
      rightLabel.style.position = 'absolute';
      rightLabel.style.right = '10px';
      rightLabel.style.top = `${100 + height/2}px`;
      rightLabel.style.color = '#222222';
      rightLabel.style.fontSize = '18px';
      rightLabel.style.fontWeight = '500';
      rightLabel.style.textAlign = 'center';
      rightLabel.style.width = '80px';
      rightLabel.style.wordWrap = 'break-word';
      rightLabel.style.whiteSpace = 'pre-wrap';
      rightLabel.style.lineHeight = '1.2';
      rightLabel.style.transform = 'translateY(-50%)';
      exportContainer.appendChild(rightLabel);
      
      const topLabel = document.createElement('div');
      topLabel.textContent = labelTexts.y1;
      topLabel.style.position = 'absolute';
      topLabel.style.top = '10px';
      topLabel.style.left = `${100 + width/2}px`;
      topLabel.style.color = '#222222';
      topLabel.style.fontSize = '18px';
      topLabel.style.fontWeight = '500';
      topLabel.style.textAlign = 'center';
      topLabel.style.width = '80px';
      topLabel.style.wordWrap = 'break-word';
      topLabel.style.whiteSpace = 'pre-wrap';
      topLabel.style.lineHeight = '1.2';
      topLabel.style.transform = 'translateX(-50%)';
      exportContainer.appendChild(topLabel);
      
      const bottomLabel = document.createElement('div');
      bottomLabel.textContent = labelTexts.y2;
      bottomLabel.style.position = 'absolute';
      bottomLabel.style.bottom = '10px';
      bottomLabel.style.left = `${100 + width/2}px`;
      bottomLabel.style.color = '#222222';
      bottomLabel.style.fontSize = '18px';
      bottomLabel.style.fontWeight = '500';
      bottomLabel.style.textAlign = 'center';
      bottomLabel.style.width = '80px';
      bottomLabel.style.wordWrap = 'break-word';
      bottomLabel.style.whiteSpace = 'pre-wrap';
      bottomLabel.style.lineHeight = '1.2';
      bottomLabel.style.transform = 'translateX(-50%)';
      exportContainer.appendChild(bottomLabel);
      
      // 将容器添加到文档中
      document.body.appendChild(exportContainer);
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      
      // 使用html2canvas截图
      html2canvas(exportContainer, {
        backgroundColor: '#ffffff', // 白色背景
        scale: 2,
        logging: true,
        useCORS: true
      }).then(canvas => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = '四象限图表.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // 清理临时元素
        document.body.removeChild(exportContainer);
      }).catch(err => {
        console.error('导出图片失败:', err);
        alert('导出图片失败，请重试');
        document.body.removeChild(exportContainer);
      });
    }
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>四象限工具</h1>
        <div className="toolbar">
          <button onClick={exportAsImage}>导出为图片</button>
        </div>
      </header>
      
      <main>
        <QuadrantView 
          ref={quadrantRef}
          quadrantTitles={quadrantTitles}
          quadrantContents={quadrantContents}
          onTitleChange={updateQuadrantTitle}
          onAddContent={addContentToQuadrant}
        />
      </main>
    </div>
  );
}

export default App;