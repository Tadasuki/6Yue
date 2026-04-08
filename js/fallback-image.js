// ====================
//   本地 Canvas 智能文字封面生成器
//   使用「江西拙楷」字体 (jiangxizhuokai.ttf)
// ====================

// 预加载江西拙楷字体
const _zhuokaiFont = new FontFace('JiangXiZhuoKai', "url('data/fonts/jiangxizhuokai.ttf')");
_zhuokaiFont.load().then(loaded => {
    document.fonts.add(loaded);
}).catch(e => {
    console.warn('[fallback-image] 江西拙楷字体加载失败:', e);
});

function generateFallbackImage(title, width = 1600, height = 800) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. 生成随机的莫兰迪/马卡龙高雅色系背景
    const hue = Math.floor(Math.random() * 360);
    // 饱和度 30%-50%，亮度 80%-90% 保证背景清爽淡雅
    ctx.fillStyle = `hsl(${hue}, 40%, 85%)`;
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制随机几何图形（建议框/色块）以增加层次感
    for (let i = 0; i < 3; i++) {
        const shapeHue = (hue + (Math.random() * 60 - 30)) % 360;
        ctx.fillStyle = `hsla(${shapeHue}, 50%, 75%, 0.4)`;

        const w = Math.random() * width * 0.8;
        const h = Math.random() * height * 0.8;
        const x = Math.random() * width - w / 2;
        const y = Math.random() * height - h / 2;
        const radius = Math.random() * 20; // 随机圆角

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
    }

    // 3. 配置文字样式 — 使用江西拙楷，如果未加载完会自动降级到 sans-serif
    const fontSize = 90;
    const fontFamily = "'JiangXiZhuoKai', sans-serif";
    ctx.font = `normal ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = '#2c3e50'; // 深蓝灰色字体，显得沉稳
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 添加文字的发光白底，防止在某些色块交界处看不清
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 12;

    // 4. 智能换行算法 (利用现代 Intl.Segmenter 避免中英文乱断字，若不支持则退化为单字拆分)
    let words = [];
    if (window.Intl && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
        words = Array.from(segmenter.segment(title)).map(s => s.segment);
    } else {
        words = title.split('');
    }

    const maxWidth = width * 0.85; // 左右各留出一定边距
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words[i];
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // 5. 渲染多行文本 (垂直居中计算)
    const lineHeight = fontSize * 1.6;
    const totalHeight = lines.length * lineHeight;
    let startY = (height - totalHeight) / 2 + fontSize / 2;

    for (let i = 0; i < Math.min(lines.length, 4); i++) { // 最多绘制 4 行
        let textToDraw = lines[i];
        if (i === 3 && lines.length > 4) textToDraw += '...'; // 超出加省略号
        ctx.fillText(textToDraw, width / 2, startY + i * lineHeight);
    }

    // 将 Canvas 转换为 base64 的图片 URL 输出
    return canvas.toDataURL('image/png');
}