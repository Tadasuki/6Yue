// ====================
//   页面个性化设置与本地持久化存储
// ====================

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');

const blurSlider = document.getElementById('bg-blur-slider');
const widgetBlurSlider = document.getElementById('widget-blur-slider');
const searchBlurSlider = document.getElementById('search-blur-slider');
const bmBlurSlider = document.getElementById('bm-blur-slider');
const modalBlurSlider = document.getElementById('modal-blur-slider');
const overlaySlider = document.getElementById('overlay-alpha-slider');
const widgetSlider = document.getElementById('widget-alpha-slider');
const searchSlider = document.getElementById('search-alpha-slider');
const themeSelect = document.getElementById('global-theme-select');
const tzSelect = document.getElementById('timezone-select');
const engineSlider = document.getElementById('engine-alpha-slider');
const bmAlphaSlider = document.getElementById('bm-alpha-slider');
const modalSlider = document.getElementById('modal-alpha-slider');
const weatherCityInput = document.getElementById('weather-city-input');
const weatherCityConfirm = document.getElementById('weather-city-confirm');
const provSelect = document.getElementById('prov-select');
const citySelect = document.getElementById('city-select');
const countySelect = document.getElementById('county-select');
const amapKeyInput = document.getElementById('amap-key-input');
const amapSecurityInput = document.getElementById('amap-security-input');
const saveAmapConfigBtn = document.getElementById('save-amap-config');

// 默认页面配置
const defaultSettings = {
    bgBlur: 5,
    widgetBlur: 20,
    searchBlur: 20,
    bmBgBlur: 20,
    modalBlur: 20,
    overlayAlpha: 0.25,
    widgetAlpha: 0.55,
    searchAlpha: 0.35,
    engineAlpha: 0.85,
    bmBgAlpha: 0.15,
    modalAlpha: 0.85,
    globalTheme: 'light', // 默认浅色模式
    timezone: 'local',
    weatherCity: '420106' // 默认天气城市 (武汉市武昌区)
};

// 应用全局主题 (统一遮罩颜色与字体配色)
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--theme-rgb', '0, 0, 0');
        document.documentElement.style.setProperty('--text-main', '#ffffff');
        document.documentElement.style.setProperty('--text-sub', '#e2e8f0');
        document.documentElement.style.setProperty('--text-shadow-rgb', '0, 0, 0');
    } else {
        document.documentElement.style.setProperty('--theme-rgb', '255, 255, 255');
        document.documentElement.style.setProperty('--text-main', '#2c3e50');
        document.documentElement.style.setProperty('--text-sub', '#4a5568');
        document.documentElement.style.setProperty('--text-shadow-rgb', '255, 255, 255');
    }
}

// 判断当前是否为移动端环境，并获取对应的本地存储键值
let isMobileMode = window.innerWidth <= 768;
function getStorageKey() {
    return isMobileMode ? 'myHomepageSettings_mobile' : 'myHomepageSettings';
}

// 从本地存储 (localStorage) 读取配置并应用
function loadSettings() {
    const saved = JSON.parse(localStorage.getItem(getStorageKey())) || defaultSettings;

    document.documentElement.style.setProperty('--bg-blur', `${saved.bgBlur}px`);
    document.documentElement.style.setProperty('--widget-blur', `${saved.widgetBlur !== undefined ? saved.widgetBlur : defaultSettings.widgetBlur}px`);
    document.documentElement.style.setProperty('--search-blur', `${saved.searchBlur !== undefined ? saved.searchBlur : defaultSettings.searchBlur}px`);
    document.documentElement.style.setProperty('--bm-bg-blur', `${saved.bmBgBlur !== undefined ? saved.bmBgBlur : defaultSettings.bmBgBlur}px`);
    document.documentElement.style.setProperty('--modal-blur', `${saved.modalBlur !== undefined ? saved.modalBlur : defaultSettings.modalBlur}px`);
    document.documentElement.style.setProperty('--overlay-alpha', saved.overlayAlpha);
    document.documentElement.style.setProperty('--widget-alpha', saved.widgetAlpha);
    document.documentElement.style.setProperty('--search-alpha', saved.searchAlpha);
    document.documentElement.style.setProperty('--engine-alpha', saved.engineAlpha !== undefined ? saved.engineAlpha : defaultSettings.engineAlpha);
    document.documentElement.style.setProperty('--bm-bg-alpha', saved.bmBgAlpha !== undefined ? saved.bmBgAlpha : defaultSettings.bmBgAlpha);
    document.documentElement.style.setProperty('--modal-alpha', saved.modalAlpha !== undefined ? saved.modalAlpha : defaultSettings.modalAlpha);

    const savedTheme = saved.globalTheme || defaultSettings.globalTheme;
    applyTheme(savedTheme);

    // 同步滑块的位置
    blurSlider.value = saved.bgBlur;
    widgetBlurSlider.value = saved.widgetBlur !== undefined ? saved.widgetBlur : defaultSettings.widgetBlur;
    searchBlurSlider.value = saved.searchBlur !== undefined ? saved.searchBlur : defaultSettings.searchBlur;
    bmBlurSlider.value = saved.bmBgBlur !== undefined ? saved.bmBgBlur : defaultSettings.bmBgBlur;
    modalBlurSlider.value = saved.modalBlur !== undefined ? saved.modalBlur : defaultSettings.modalBlur;
    overlaySlider.value = saved.overlayAlpha;
    widgetSlider.value = saved.widgetAlpha;
    searchSlider.value = saved.searchAlpha;
    engineSlider.value = saved.engineAlpha !== undefined ? saved.engineAlpha : defaultSettings.engineAlpha;
    bmAlphaSlider.value = saved.bmBgAlpha !== undefined ? saved.bmBgAlpha : defaultSettings.bmBgAlpha;
    modalSlider.value = saved.modalAlpha !== undefined ? saved.modalAlpha : defaultSettings.modalAlpha;
    tzSelect.value = saved.timezone || 'local';
    themeSelect.value = savedTheme;
    weatherCityInput.value = saved.weatherCity || defaultSettings.weatherCity;
}

// 监听滑块拖动：实时应用配置并保存
function applyAndSaveSettings() {
    const settings = {
        bgBlur: blurSlider.value,
        widgetBlur: widgetBlurSlider.value,
        searchBlur: searchBlurSlider.value,
        bmBgBlur: bmBlurSlider.value,
        modalBlur: modalBlurSlider.value,
        overlayAlpha: overlaySlider.value,
        widgetAlpha: widgetSlider.value,
        searchAlpha: searchSlider.value,
        engineAlpha: engineSlider.value,
        bmBgAlpha: bmAlphaSlider.value,
        modalAlpha: modalSlider.value,
        globalTheme: themeSelect.value,
        timezone: tzSelect.value,
        weatherCity: weatherCityInput.value.trim() || defaultSettings.weatherCity
    };

    document.documentElement.style.setProperty('--bg-blur', `${settings.bgBlur}px`);
    document.documentElement.style.setProperty('--widget-blur', `${settings.widgetBlur}px`);
    document.documentElement.style.setProperty('--search-blur', `${settings.searchBlur}px`);
    document.documentElement.style.setProperty('--bm-bg-blur', `${settings.bmBgBlur}px`);
    document.documentElement.style.setProperty('--modal-blur', `${settings.modalBlur}px`);
    document.documentElement.style.setProperty('--overlay-alpha', settings.overlayAlpha);
    document.documentElement.style.setProperty('--widget-alpha', settings.widgetAlpha);
    document.documentElement.style.setProperty('--search-alpha', settings.searchAlpha);
    document.documentElement.style.setProperty('--engine-alpha', settings.engineAlpha);
    document.documentElement.style.setProperty('--bm-bg-alpha', settings.bmBgAlpha);
    document.documentElement.style.setProperty('--modal-alpha', settings.modalAlpha);

    applyTheme(settings.globalTheme);

    localStorage.setItem(getStorageKey(), JSON.stringify(settings));

    // 如果切换了时区，立刻强制刷新一次时钟
    if (typeof updateTime === 'function') updateTime();
    // 如果切换了天气城市，立刻强制刷新一次天气
    if (typeof getWeather === 'function') getWeather();
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

// 绑定 UI 面板事件
settingsBtn.addEventListener('click', () => {
    bringModalToFront(settingsModal);
    settingsModal.style.display = 'flex';
    // 采用延时来保证 CSS 过渡动画能够正常触发
    setTimeout(() => settingsModal.classList.add('show'), 10);
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.remove('show');
    setTimeout(() => settingsModal.style.display = 'none', 300);
});

// 监听鼠标在面板上的按下操作：实现点击面板任意区域即可置顶
settingsModal.addEventListener('mousedown', () => {
    bringModalToFront(settingsModal);
});

// 绑定滑块滑动事件
blurSlider.addEventListener('input', applyAndSaveSettings);
widgetBlurSlider.addEventListener('input', applyAndSaveSettings);
searchBlurSlider.addEventListener('input', applyAndSaveSettings);
bmBlurSlider.addEventListener('input', applyAndSaveSettings);
modalBlurSlider.addEventListener('input', applyAndSaveSettings);
overlaySlider.addEventListener('input', applyAndSaveSettings);
widgetSlider.addEventListener('input', applyAndSaveSettings);
searchSlider.addEventListener('input', applyAndSaveSettings);
themeSelect.addEventListener('change', applyAndSaveSettings);
tzSelect.addEventListener('change', applyAndSaveSettings);
engineSlider.addEventListener('input', applyAndSaveSettings);
bmAlphaSlider.addEventListener('input', applyAndSaveSettings);
modalSlider.addEventListener('input', applyAndSaveSettings);
weatherCityConfirm.addEventListener('click', applyAndSaveSettings);

// 通用：弹窗内部 Tab 选项卡切换逻辑
document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const parentTabs = e.target.parentElement;
        parentTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        parentTabs.nextElementSibling.parentElement.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.target).classList.add('active');
    });
});

// 供外部模块调用：打开设置并切换到指定选项卡
window.openSettingsTab = function (targetId) {
    const tabs = document.getElementById('setting-tabs');
    if (!tabs || !targetId) return;
    tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    settingsModal.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const targetBtn = tabs.querySelector(`[data-target="${targetId}"]`);
    const targetPane = document.getElementById(targetId);
    if (targetBtn) targetBtn.classList.add('active');
    if (targetPane) targetPane.classList.add('active');
};

// 初始化 API 密钥输入框
if (window.AMapConfigManager) {
    const config = window.AMapConfigManager.getConfig();
    amapKeyInput.value = config.key || '';
    amapSecurityInput.value = config.securityJsCode || '';
}

// 保存 API 密钥配置
if (saveAmapConfigBtn) {
    saveAmapConfigBtn.addEventListener('click', () => {
        if (!window.AMapConfigManager) return;
        const key = amapKeyInput.value.trim();
        const securityJsCode = amapSecurityInput.value.trim();
        if (!key || !securityJsCode) {
            alert('请先完整填写 Key 和 securityJsCode。');
            return;
        }
        window.AMapConfigManager.saveConfig({ key, securityJsCode });
        window.AMapConfigManager.hideFirstUseModal();
        if (typeof getWeather === 'function') getWeather();
        alert('✅ 高德密钥已保存并生效。');
    });
}

// 监听窗口尺寸变化，动态切换桌面端/移动端配置
window.addEventListener('resize', () => {
    const currentlyMobile = window.innerWidth <= 768;
    if (currentlyMobile !== isMobileMode) {
        isMobileMode = currentlyMobile;
        loadSettings(); // 尺寸跨越临界点时，重新加载对应的端配置
    }
});

// 页面加载时初始化设置
loadSettings();

// ====================
//   省市县三级联动逻辑 (基于本地 citycode.json)
// ====================
let cityData = [];

// 提取并解析本地 data/pca-code.json 文件
fetch('data/pca-code.json')
    .then(res => res.json())
    .then(data => {
        cityData = Array.isArray(data) ? data : [];
        if (cityData.length > 0) populateProv();
    })
    .catch(err => console.warn('未能加载本地 data/pca-code.json，三级联动已禁用。', err));

function populateProv() {
    provSelect.innerHTML = '<option value="">省份</option>';
    cityData.forEach((prov, i) => {
        provSelect.insertAdjacentHTML('beforeend', `<option value="${i}">${prov.name}</option>`);
    });
}

provSelect.addEventListener('change', (e) => {
    const pIdx = e.target.value;
    citySelect.innerHTML = '<option value="">城市</option>';
    countySelect.innerHTML = '<option value="">区县</option>';
    if (pIdx === '') return;

    const cities = cityData[pIdx].children || [];
    cities.forEach((city, i) => {
        citySelect.insertAdjacentHTML('beforeend', `<option value="${i}">${city.name}</option>`);
    });
    weatherCityInput.value = cityData[pIdx].code;
});

citySelect.addEventListener('change', (e) => {
    const pIdx = provSelect.value;
    const cIdx = e.target.value;
    countySelect.innerHTML = '<option value="">区县</option>';
    if (cIdx === '') return;

    const cities = cityData[pIdx].children || [];
    const counties = cities[cIdx].children || [];
    counties.forEach((county) => {
        countySelect.insertAdjacentHTML('beforeend', `<option value="${county.code}">${county.name}</option>`);
    });
    weatherCityInput.value = cities[cIdx].code;
});

countySelect.addEventListener('change', (e) => {
    if (e.target.value) weatherCityInput.value = e.target.value;
});

// ====================
//   界面配置的导入与导出
// ====================
document.getElementById('export-settings-btn').addEventListener('click', () => {
    const saved = localStorage.getItem(getStorageKey()) || JSON.stringify(defaultSettings);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(saved);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const modeStr = isMobileMode ? "mobile" : "desktop";
    downloadAnchorNode.setAttribute("download", `my_settings_backup_${modeStr}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

document.getElementById('import-settings-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (typeof importedData === 'object' && importedData !== null) {
                localStorage.setItem(getStorageKey(), JSON.stringify(importedData));
                loadSettings(); // 重新加载设置并立即应用到 UI 和 CSS 变量上
                alert(`✅ ${isMobileMode ? '移动端' : '桌面端'}界面配置导入成功！`);
            } else {
                alert("❌ 文件格式错误。");
            }
        } catch (err) {
            alert("❌ 解析 JSON 文件失败。");
        }
        e.target.value = ''; // 重置文件输入框
    };
    reader.readAsText(file);
});