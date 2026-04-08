// ====================
//   书签数据与动态渲染逻辑
// ====================

let defaultBookmarksData = [];

// 当前使用的书签数据
let currentBookmarks = [];

// 辅助函数：通过 URL 自动提取域名并获取高清 Favicon
function getIconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        // 调用 Google 提供的免费高解析度图标抓取接口
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
        return ''; // 如果 URL 不规范，则返回空
    }
}

// 将数据渲染到页面上的核心函数
function renderBookmarks() {
    const container = document.getElementById('bookmark-container');
    if (!container) return;
    
    container.innerHTML = ''; // 清空容器

    currentBookmarks.forEach(group => {
        let linksHtml = '';
        
        group.links.forEach(link => {
            const iconSrc = link.icon || getIconUrl(link.url); // 支持自定义图标，没有则自动获取
            linksHtml += `
                <a href="${link.url}" class="bookmark" target="_blank" title="${link.name}">
                    <div class="icon-box"><img src="${iconSrc}" alt="" loading="lazy"></div>
                    <span class="bookmark-name">${link.name}</span>
                </a>
            `;
        });

        const categoryHtml = `<div class="category"><h4>${group.category}</h4><div class="bookmarks">${linksHtml}</div></div>`;
        container.insertAdjacentHTML('beforeend', categoryHtml);
    });
    
    updateCategorySelect(); // 每次渲染后同步更新表单下拉框
    renderBookmarkManager(); // 同步更新管理面板列表
}


// ====================
//   本地持久化存储与管理逻辑
// ====================

function saveBookmarksData() {
    localStorage.setItem('myBookmarksData', JSON.stringify(currentBookmarks));
    renderBookmarks();
}

async function initBookmarks() {
    // 先从外部 JSON 文件拉取默认配置
    try {
        const res = await fetch('data/bookmarks.json');
        defaultBookmarksData = await res.json();
    } catch (err) {
        console.warn('加载默认书签文件 data/bookmarks.json 失败:', err);
    }

    const saved = localStorage.getItem('myBookmarksData');
    if (saved) {
        try { currentBookmarks = JSON.parse(saved); } catch(e) { currentBookmarks = defaultBookmarksData; }
    } else {
        currentBookmarks = JSON.parse(JSON.stringify(defaultBookmarksData)); // 深拷贝默认数据
    }
    renderBookmarks();
}


// ====================
//   书签管理面板 UI 交互
// ====================

// 渲染“管理书签列表”面板内容
function renderBookmarkManager() {
    const managerList = document.getElementById('bm-manager-list');
    if (!managerList) return;
    
    managerList.innerHTML = '';
    currentBookmarks.forEach((group, catIndex) => {
        let itemsHtml = '';
        group.links.forEach((link, bmIndex) => {
            itemsHtml += `
                <div class="bm-mg-item">
                    <span title="${link.url}"><img src="${link.icon || getIconUrl(link.url)}" alt="">${link.name}</span>
                    <div class="bm-mg-actions">
                        <button class="bm-action-btn" data-action="editBm" data-cat="${catIndex}" data-bm="${bmIndex}" title="编辑书签">✎</button>
                        <button class="bm-action-btn del" data-action="delBm" data-cat="${catIndex}" data-bm="${bmIndex}" title="删除书签">🗑️</button>
                    </div>
                </div>
            `;
        });
        const groupHtml = `
            <div class="bm-mg-group">
                <div class="bm-mg-cat">
                    <span>📂 ${group.category}</span>
                    <div class="bm-mg-actions">
                        <button class="bm-action-btn" data-action="editCat" data-cat="${catIndex}" title="重命名分类">✎</button>
                        <button class="bm-action-btn del" data-action="delCat" data-cat="${catIndex}" title="删除整个分类">🗑️</button>
                    </div>
                </div>
                <div class="bm-mg-items">${itemsHtml}</div>
            </div>
        `;
        managerList.insertAdjacentHTML('beforeend', groupHtml);
    });
}

// 绑定列表内操作的事件代理 (编辑、删除)
document.getElementById('bm-manager-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.bm-action-btn');
    if (!btn) return;
    const action = btn.dataset.action, cIdx = btn.dataset.cat, bIdx = btn.dataset.bm;
    
    if (action === 'delCat' && confirm(`确定要删除分类 "${currentBookmarks[cIdx].category}" 及其下的所有书签吗？`)) {
        currentBookmarks.splice(cIdx, 1);
        saveBookmarksData();
    } else if (action === 'editCat') {
        document.getElementById('edit-cat-idx').value = cIdx;
        document.getElementById('edit-cat-name').value = currentBookmarks[cIdx].category;
        const catModal = document.getElementById('edit-cat-modal');
        catModal.style.display = 'flex';
        setTimeout(() => catModal.classList.add('show'), 10);
    } else if (action === 'delBm' && confirm(`确定要删除书签 "${currentBookmarks[cIdx].links[bIdx].name}" 吗？`)) {
        currentBookmarks[cIdx].links.splice(bIdx, 1);
        saveBookmarksData();
    } else if (action === 'editBm') {
        const link = currentBookmarks[cIdx].links[bIdx];
        document.getElementById('edit-bm-cidx').value = cIdx;
        document.getElementById('edit-bm-bidx').value = bIdx;
        document.getElementById('edit-bm-name').value = link.name;
        document.getElementById('edit-bm-url').value = link.url;
        document.getElementById('edit-bm-icon').value = link.icon || '';
        document.getElementById('edit-bm-category-select').value = currentBookmarks[cIdx].category;
        document.getElementById('edit-bm-new-category').value = '';
        
        const editModal = document.getElementById('edit-bm-modal');
        editModal.style.display = 'flex';
        setTimeout(() => editModal.classList.add('show'), 10);
    }
});

const bmModal = document.getElementById('bookmark-modal');
const bmForm = document.getElementById('tab-bm-add');
const catSelect = document.getElementById('bm-category-select');

// 更新分类下拉菜单
function updateCategorySelect() {
    catSelect.innerHTML = '';
    const editCatSelect = document.getElementById('edit-bm-category-select');
    if (editCatSelect) editCatSelect.innerHTML = '';
    
    currentBookmarks.forEach(group => {
        catSelect.insertAdjacentHTML('beforeend', `<option value="${group.category}">${group.category}</option>`);
        if (editCatSelect) editCatSelect.insertAdjacentHTML('beforeend', `<option value="${group.category}">${group.category}</option>`);
    });
}

// 辅助函数：将被点击的悬浮窗置于最顶层
function bringModalToFront(modal) {
    document.querySelectorAll('.settings-modal').forEach(m => {
        if (!m.classList.contains('centered-modal')) {
            m.style.zIndex = 101; // 恢复默认的基础层级
        }
    });
    modal.style.zIndex = 102; // 当前点击的面板提升层级
}

// 面板开合
document.getElementById('manage-bm-btn').addEventListener('click', () => {
    bringModalToFront(bmModal);
    bmModal.style.display = 'flex';
    setTimeout(() => bmModal.classList.add('show'), 10);
});
document.getElementById('close-bookmark-modal').addEventListener('click', () => {
    bmModal.classList.remove('show');
    setTimeout(() => bmModal.style.display = 'none', 300);
});

// 监听鼠标在面板上的按下操作：实现点击面板任意区域即可置顶
bmModal.addEventListener('mousedown', () => {
    bringModalToFront(bmModal);
});

// 处理添加表单提交
bmForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('bm-name').value.trim();
    const url = document.getElementById('bm-url').value.trim();
    const icon = document.getElementById('bm-icon').value.trim();
    const newCat = document.getElementById('bm-new-category').value.trim();
    const selectedCat = catSelect.value;
    
    const targetCategory = newCat || selectedCat;
    const newLink = { name, url };
    if (icon) newLink.icon = icon;

    // 查找是否已有该分类，有则推入，无则新建分类对象
    let group = currentBookmarks.find(g => g.category === targetCategory);
    if (group) {
        group.links.push(newLink);
    } else {
        currentBookmarks.push({ category: targetCategory, links: [newLink] });
    }

    saveBookmarksData();
    bmForm.reset();
    alert(`✅ 已成功添加书签：${name}`);
});

// 导出配置 (.json文件)
document.getElementById('export-bm-btn').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentBookmarks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_bookmarks_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

// 导入配置
document.getElementById('import-bm-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                currentBookmarks = importedData;
                saveBookmarksData();
                alert("✅ 书签配置导入成功！");
            } else {
                alert("❌ 文件格式错误。");
            }
        } catch(err) {
            alert("❌ 解析 JSON 文件失败。");
        }
        e.target.value = ''; // 重置文件输入框
    };
    reader.readAsText(file);
});

// ====================
//   处理编辑弹窗的提交与关闭
// ====================
document.getElementById('close-edit-bm-modal').addEventListener('click', () => {
    const m = document.getElementById('edit-bm-modal');
    m.classList.remove('show');
    setTimeout(() => m.style.display = 'none', 300);
});

document.getElementById('edit-bm-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const cIdx = parseInt(document.getElementById('edit-bm-cidx').value);
    const bIdx = parseInt(document.getElementById('edit-bm-bidx').value);
    
    const name = document.getElementById('edit-bm-name').value.trim();
    const url = document.getElementById('edit-bm-url').value.trim();
    const icon = document.getElementById('edit-bm-icon').value.trim();
    const newCat = document.getElementById('edit-bm-new-category').value.trim();
    const selectedCat = document.getElementById('edit-bm-category-select').value;
    
    const targetCategory = newCat || selectedCat;
    const updatedLink = { name, url };
    if (icon) updatedLink.icon = icon;
    
    const oldCategoryName = currentBookmarks[cIdx].category;
    
    if (targetCategory === oldCategoryName) {
        currentBookmarks[cIdx].links[bIdx] = updatedLink;
    } else {
        currentBookmarks[cIdx].links.splice(bIdx, 1);
        if (currentBookmarks[cIdx].links.length === 0) currentBookmarks.splice(cIdx, 1);
        
        let group = currentBookmarks.find(g => g.category === targetCategory);
        if (group) group.links.push(updatedLink);
        else currentBookmarks.push({ category: targetCategory, links: [updatedLink] });
    }
    
    saveBookmarksData();
    document.getElementById('close-edit-bm-modal').click();
});

document.getElementById('close-edit-cat-modal').addEventListener('click', () => {
    const m = document.getElementById('edit-cat-modal');
    m.classList.remove('show');
    setTimeout(() => m.style.display = 'none', 300);
});

document.getElementById('edit-cat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const cIdx = parseInt(document.getElementById('edit-cat-idx').value);
    const newName = document.getElementById('edit-cat-name').value.trim();
    
    if (newName) {
        currentBookmarks[cIdx].category = newName;
        saveBookmarksData();
    }
    document.getElementById('close-edit-cat-modal').click();
});

// 初始化 (移至文件末尾，确保所有 DOM 变量均已声明，防止报错阻断运行)
initBookmarks();