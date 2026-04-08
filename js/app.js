// ====================
//   全局体验优化：背景缓存、搜索加速、移动端适配、侧边栏拖拽
// ====================

document.addEventListener('DOMContentLoaded', () => {
    // 1. 移动端适配：移动端访问时默认将侧边栏收起
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }
    }

    // 2. 提升搜索响应速度：拦截表单使用 URL 直接跳转，跳过默认提交渲染开销
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const input = document.getElementById('search-input');
            const action = this.getAttribute('action');
            const param = input.getAttribute('name') || 'q';
            const query = encodeURIComponent(input.value);
            if (query) {
                window.location.href = `${action}?${param}=${query}`;
            }
        }, true);
    }

    // 3. 优化交互：侧边栏收起后的 Tag 可上下拖拽
    const toggleBtn = document.getElementById('toggle-btn');
    if (toggleBtn) {
        let isDragging = false, startY = 0, currentMarginTop = 0;

        const startDrag = (y) => {
            isDragging = true;
            startY = y;
            // 使用 margin-top 可以避免破坏元素原有的 transform: translateY 等居中样式
            currentMarginTop = parseInt(window.getComputedStyle(toggleBtn).marginTop) || 0;
            toggleBtn.style.transition = 'none';
            toggleBtn.style.cursor = 'grabbing';
        };

        const moveDrag = (y, e) => {
            if (!isDragging) return;
            e.preventDefault(); // 阻止手机端拖动按钮时页面跟着滚动
            const dy = y - startY;
            toggleBtn.style.marginTop = `${currentMarginTop + dy}px`;
        };

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            toggleBtn.style.transition = '';
            toggleBtn.style.cursor = 'pointer';
        };

        // 兼容移动端触摸
        toggleBtn.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientY), { passive: false });
        toggleBtn.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientY, e), { passive: false });
        toggleBtn.addEventListener('touchend', endDrag);

        // 兼容 PC 端鼠标拖拽
        toggleBtn.addEventListener('mousedown', (e) => startDrag(e.clientY));
        document.addEventListener('mousemove', (e) => moveDrag(e.clientY, e), { passive: false });
        document.addEventListener('mouseup', endDrag);
    }

    // 4. 背景图缓存 (每日 UTC+8 凌晨 4 点刷新) & 5. 修复雾化层与笼罩层长度不够
    const loadBackground = () => {
        const now = new Date();
        // 获取当前时间的 UTC 毫秒数，加上 8 小时转换为北京时间，再减去 4 小时使得凌晨 4 点前算作“昨天”
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const utc8 = new Date(utc + (3600000 * 8));

        // 构造校验缓存有效性的关键 Key (如: bg_cache_20240312)
        const dateKey = `bg_cache_${utc8.getFullYear()}${(utc8.getMonth() + 1).toString().padStart(2, '0')}${utc8.getDate().toString().padStart(2, '0')}`;

        const bgUrl = "https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN";
        const cachedKey = localStorage.getItem('bg_cache_key');
        const cachedData = localStorage.getItem('bg_cache_data');

        const applyBgAndFixStyle = (url) => {
            let style = document.getElementById('dynamic-bg-style');
            if (!style) {
                style = document.createElement('style');
                style.id = 'dynamic-bg-style';
                document.head.appendChild(style);
            }
            // 强制覆盖全局样式以根治滑动时漏白、背景断裂等问题
            style.innerHTML = `
                body {
                    background-image: url('${url}') !important;
                    background-size: cover !important;
                    background-position: center !important;
                    background-attachment: fixed !important;
                    min-height: 100vh !important;
                    margin: 0;
                }
                /* 针对伪元素与遮罩层使用 fixed 并外扩边缘，防止滚动时边缘出现雾化瑕疵 */
                body::before, body::after, .bg-overlay, .bg-blur, .overlay {
                    position: fixed !important;
                    top: -5vh !important;
                    left: -5vw !important;
                    width: 110vw !important;
                    height: 110vh !important;
                    min-height: 110vh !important;
                    background-attachment: fixed !important;
                    z-index: -1;
                }
            `;
        };

        // 检查是否命中缓存
        if (cachedKey === dateKey && cachedData) {
            applyBgAndFixStyle(cachedData);
        } else {
            // 缓存未命中或已过期，抓取并转换为 Base64
            fetch(bgUrl)
                .then(res => {
                    if (!res.ok) throw new Error("Fetch failed");
                    return res.blob();
                })
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        // 清除掉旧的背景缓存，不影响其他配置
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('bg_cache_')) localStorage.removeItem(key);
                        });
                        try {
                            localStorage.setItem('bg_cache_key', dateKey);
                            localStorage.setItem('bg_cache_data', base64data);
                        } catch (e) {
                            console.warn("Storage quota exceeded", e);
                        }
                        applyBgAndFixStyle(base64data);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(err => {
                    // 当跨域被阻止或网络失败时，优雅降级为利用浏览器自带的网络缓存机制
                    console.warn("Fetch fallback to URL", err);
                    applyBgAndFixStyle(`${bgUrl}&_t=${dateKey}`);
                });
        }
    };
    loadBackground();
});