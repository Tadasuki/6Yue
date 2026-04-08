// ====================
//   搜索引擎切换逻辑
// ====================
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const engineDropdown = document.getElementById('engine-dropdown');
const engineList = document.getElementById('engine-list');
const currentEngineImg = document.querySelector('#current-engine img');
const engineOptions = document.querySelectorAll('#engine-list li');
const suggestionsBox = document.getElementById('search-suggestions');

// 动态添加 DNS 预解析与 TCP 预连接，从底层加速后续的网络跳转请求
function updatePreconnect(url) {
    let link = document.getElementById('search-preconnect');
    if (!link) {
        link = document.createElement('link');
        link.id = 'search-preconnect';
        link.rel = 'preconnect';
        document.head.appendChild(link);
    }
    try { link.href = new URL(url).origin; } catch (e) { }
}
// 页面初始化时预连接默认搜索引擎
updatePreconnect(searchForm.action);

// 点击展开/收起下拉菜单
engineDropdown.addEventListener('click', function (e) {
    engineList.classList.toggle('show');
    e.stopPropagation();
});

document.addEventListener('click', function (e) {
    engineList.classList.remove('show');
    // 点击页面其他空白处收起候选词
    if (!e.target.closest('.search-box')) {
        suggestionsBox.style.display = 'none';
    }
});

// 点击选择搜索引擎
engineOptions.forEach(option => {
    option.addEventListener('click', function () {
        searchForm.action = this.getAttribute('data-action');
        searchInput.name = this.getAttribute('data-param');
        searchInput.placeholder = `输入关键词以使用${this.getAttribute('data-name')}进行搜索...`;
        currentEngineImg.src = this.querySelector('img').src;
        updatePreconnect(searchForm.action); // 切换时立刻触发预连接

        // 如果切换为 WolframAlpha，立即隐藏候选词框
        if (searchForm.action.includes('wolframalpha.com')) {
            suggestionsBox.style.display = 'none';
        } else if (searchInput.value.trim()) {
            // 切换回其他支持候选词的引擎时，重新请求候选词
            fetchSuggestions(searchInput.value.trim());
        }
    });
});

// ====================
//   搜索候选词 (自动补全) 与按键导航逻辑
// ====================
let debounceTimer;
let currentSuggestionIndex = -1;

searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    const keyword = this.value.trim();
    currentSuggestionIndex = -1; // 每次重新输入时重置选中项

    // 如果为空，或当前搜索引擎是 WolframAlpha，则不显示候选词
    if (!keyword || searchForm.action.includes('wolframalpha.com')) {
        suggestionsBox.style.display = 'none';
        return;
    }

    // 延迟 200ms 防抖，避免用户快速打字时疯狂请求 API
    debounceTimer = setTimeout(() => {
        fetchSuggestions(keyword);
    }, 200);
});

function fetchSuggestions(keyword) {
    const script = document.createElement('script');
    const callbackName = 'searchSuggestCb_' + Date.now(); // 创建唯一回调名防冲突

    window[callbackName] = function (data) {
        renderSuggestions(data[1] || []); // Google Chrome 接口的候选词数组存放在 data[1] 中
        delete window[callbackName];
        document.head.removeChild(script);
    };

    // 使用 Google 的 JSONP 候选词接口 (client=chrome 支持 callback 回调，返回干净的 JSON 数组)
    script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(keyword)}&callback=${callbackName}`;
    document.head.appendChild(script);
}

function renderSuggestions(list) {
    if (!list || list.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }
    // 截取前 8 个候选词渲染到 HTML
    suggestionsBox.innerHTML = list.slice(0, 8).map(item => `<li>${item}</li>`).join('');
    suggestionsBox.style.display = 'block';
}

// 鼠标点击候选词自动提交
suggestionsBox.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
        searchInput.value = e.target.innerText;
        suggestionsBox.style.display = 'none';
        // 调用原生的 requestSubmit 以触发我们在 app.js 里写的快速拦截跳转逻辑
        if (typeof searchForm.requestSubmit === 'function') searchForm.requestSubmit();
        else searchForm.submit();
    }
});

// 键盘上下键导航候选词
searchInput.addEventListener('keydown', function (e) {
    const items = suggestionsBox.querySelectorAll('li');
    if (items.length === 0 || suggestionsBox.style.display === 'none') return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentSuggestionIndex = (currentSuggestionIndex + 1) % items.length;
        items.forEach(item => item.classList.remove('active'));
        items[currentSuggestionIndex].classList.add('active');
        searchInput.value = items[currentSuggestionIndex].innerText;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentSuggestionIndex = (currentSuggestionIndex - 1 + items.length) % items.length;
        items.forEach(item => item.classList.remove('active'));
        items[currentSuggestionIndex].classList.add('active');
        searchInput.value = items[currentSuggestionIndex].innerText;
    }
});