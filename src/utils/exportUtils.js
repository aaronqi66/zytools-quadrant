import html2canvas from 'html2canvas';

// 导出为图片
export const exportAsImage = async (element) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高导出图片质量
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `四象限_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('导出图片失败:', error);
  }
};

// 添加到全局对象，方便调用
window.exportAsImage = () => {
  const quadrantElement = document.querySelector('.quadrant-container');
  if (quadrantElement) {
    exportAsImage(quadrantElement);
  }
};