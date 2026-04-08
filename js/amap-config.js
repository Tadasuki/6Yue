// ====================
//   高德密钥配置与 SDK 动态加载
// ====================

(function () {
    const STORAGE_KEY = 'amapApiConfig';
    let sdkPromise = null;

    function getConfig() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function isConfigured(config = getConfig()) {
        return Boolean(config.key && config.securityJsCode);
    }

    function saveConfig(config) {
        const normalized = {
            key: (config.key || '').trim(),
            securityJsCode: (config.securityJsCode || '').trim()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    function loadSdk() {
        if (window.AMap) return Promise.resolve(window.AMap);
        if (sdkPromise) return sdkPromise;

        const config = getConfig();
        if (!isConfigured(config)) {
            return Promise.reject(new Error('AMap key is not configured'));
        }

        window._AMapSecurityConfig = {
            securityJsCode: config.securityJsCode
        };

        sdkPromise = new Promise((resolve, reject) => {
            const existing = document.getElementById('amap-sdk-script');
            if (existing) {
                existing.addEventListener('load', () => resolve(window.AMap), { once: true });
                existing.addEventListener('error', () => reject(new Error('AMap SDK load failed')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = 'amap-sdk-script';
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(config.key)}`;
            script.async = true;
            script.onload = () => resolve(window.AMap);
            script.onerror = () => reject(new Error('AMap SDK load failed'));
            document.head.appendChild(script);
        });

        return sdkPromise;
    }

    function showFirstUseModal() { }
    function hideFirstUseModal() { }

    function openSettingsToKeyTab() {
        const settingsModal = document.getElementById('settings-modal');
        if (!settingsModal) return;
        settingsModal.style.display = 'flex';
        setTimeout(() => settingsModal.classList.add('show'), 10);
        if (typeof window.openSettingsTab === 'function') {
            window.openSettingsTab('tab-api');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!isConfigured()) {
            const weatherEl = document.getElementById('weather');
            if (weatherEl) {
                weatherEl.textContent = '高德密钥未配置（点击这里去设置）';
                weatherEl.removeAttribute('href');
                weatherEl.onclick = function (e) {
                    e.preventDefault();
                    openSettingsToKeyTab();
                };
            }
        }
    });

    window.AMapConfigManager = {
        storageKey: STORAGE_KEY,
        getConfig,
        saveConfig,
        isConfigured,
        loadSdk,
        openSettingsToKeyTab,
        hideFirstUseModal,
        showFirstUseModal
    };
})();
