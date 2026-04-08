// ====================
//   高德天气 API 接入
// ====================

// 预加载城市代码映射字典
let weatherIdMap = null;
fetch('data/weather-map.json')
    .then(res => res.json())
    .then(map => {
        weatherIdMap = map;
        console.log('天气字典已成功加载');
    })
    .catch(err => console.error('天气字典加载失败:', err));

// 辅助函数：根据天气文字返回对应的 Emoji 图标
function getWeatherEmoji(weatherText) {
    if (weatherText.includes('晴')) return '☀️';
    if (weatherText.includes('多云')) return '⛅️';
    if (weatherText.includes('阴')) return '☁️';
    if (weatherText.includes('雷')) return '⛈️';
    if (weatherText.includes('雨')) return '🌧️';
    if (weatherText.includes('雪')) return '❄️';
    if (weatherText.includes('雾') || weatherText.includes('霾')) return '🌫️';
    if (weatherText.includes('风')) return '💨';
    return '🌤️'; // 如果都不匹配，返回一个默认图标
}

function getWeather() {
    const configMgr = window.AMapConfigManager;
    if (!configMgr || !configMgr.isConfigured()) {
        const weatherEl = document.getElementById('weather');
        weatherEl.textContent = '高德密钥未配置（点击马上配置）';
        weatherEl.removeAttribute('href');
        weatherEl.onclick = function (e) {
            e.preventDefault();
            if (configMgr && typeof configMgr.openSettingsToKeyTab === 'function') {
                configMgr.openSettingsToKeyTab();
            }
        };
        return;
    }

    let cityAdcode = '420100';
    try {
        const isMobileMode = window.innerWidth <= 768;
        const storageKey = isMobileMode ? 'myHomepageSettings_mobile' : 'myHomepageSettings';
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved && saved.weatherCity) cityAdcode = saved.weatherCity;
    } catch (e) { }

    // 添加后缀 _v2 强制废弃之前的错误/降级缓存，让用户直接看到生效的中国天气网链接
    const cacheKey = 'weatherCache_v2_' + cityAdcode;
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    const now = Date.now();

    // 如果缓存存在且距今不到 180 分钟 (10800000 毫秒)，直接使用缓存以节约 API 请求
    if (cached && (now - cached.timestamp < 10800000)) {
        const weatherEl = document.getElementById('weather');
        weatherEl.textContent = cached.html;
        if (cached.href) weatherEl.href = cached.href;
        return;
    }

    configMgr.loadSdk().then(() => {
        AMap.plugin('AMap.Weather', function () {
            const weather = new AMap.Weather();
            weather.getLive(cityAdcode, function (err, data) {
                if (!err) {
                    const html = `${getWeatherEmoji(data.weather)} ${data.city} ${data.weather} ${data.temperature}°C`;
                    const weatherEl = document.getElementById('weather');
                    weatherEl.textContent = html;
                    weatherEl.onclick = null;

                    const updateDOMAndCache = (mapData) => {
                        let weatherHref = `https://www.weather.com.cn/search/${encodeURIComponent(data.city)}.shtml`; // 新的默认天气链接，如果无法获取城市代码，则跳转到天气网搜索页
                        if (mapData) {
                            const matchId = mapData[data.adcode]
                                || mapData[data.adcode.replace(/00$/, '')]
                                || mapData[data.adcode.replace(/0000$/, '')];
                            if (matchId) {
                                weatherHref = `https://www.weather.com.cn/weather1d/${matchId}.shtml`;
                            }
                        }
                        weatherEl.href = weatherHref;
                        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, html: html, href: weatherHref }));
                    };

                    if (weatherIdMap) {
                        updateDOMAndCache(weatherIdMap);
                    } else {
                        // 如果字典还未加载完成，等待其加载
                        fetch('data/weather-map.json')
                            .then(res => res.json())
                            .then(map => {
                                weatherIdMap = map;
                                updateDOMAndCache(map);
                            })
                            .catch(err => {
                                console.error("加载天气字典失败:", err);
                                updateDOMAndCache(null);
                            });
                    }

                } else {
                    document.getElementById('weather').textContent = `天气获取失败`;
                }
            });
        });
    }).catch(() => {
        const weatherEl = document.getElementById('weather');
        weatherEl.textContent = '高德密钥无效或加载失败（点击重新配置）';
        weatherEl.removeAttribute('href');
        weatherEl.onclick = function (e) {
            e.preventDefault();
            if (typeof configMgr.openSettingsToKeyTab === 'function') {
                configMgr.openSettingsToKeyTab();
            }
        };
    });
}

// 页面加载时自动调用一次获取天气
getWeather();