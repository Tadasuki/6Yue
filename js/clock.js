// ====================
//   时钟与日期逻辑
// ====================

// 辅助函数：根据公历日期获取常见节日
function getFestival(month, day) {
    const festivals = {
        '01-01': '元旦', 
        '02-14': '情人节', 
        '03-08': '妇女节',
        '05-01': '劳动节',
        '05-04': '青年节',
        '06-01': '儿童节', 
        '09-10': '教师节',
        '10-01': '国庆节', 
        '12-25': '圣诞节'
    };
    return festivals[`${month}-${day}`] || '';
}

// 定义一个更新时间的函数
function updateTime() {
    const realNow = new Date();
    let tz = undefined;
    
    // 读取设置中选定的时区
    try {
        const isMobileMode = window.innerWidth <= 768;
        const storageKey = isMobileMode ? 'myHomepageSettings_mobile' : 'myHomepageSettings';
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved && saved.timezone && saved.timezone !== 'local') tz = saved.timezone;
    } catch(e) {}

    // 核心黑科技：将其转换为指定时区表现的 Date 对象，方便提取当地的时分秒
    let now = realNow;
    if (tz) now = new Date(realNow.toLocaleString('en-US', { timeZone: tz }));
    
    // 获取当前小时和分钟
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // 处理公历年月日与星期
    const year = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
    const dateStr = `${year}年${monthStr}月${dayStr}日 星期${week}`;

    // 处理农历 (必须基于真实 UTC 时间 realNow，并指定时区，才能保证跨时区时农历日期的精准计算)
    const lunarFormatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { month: 'long', day: 'numeric', timeZone: tz });
    const lunarStr = '农历' + lunarFormatter.format(realNow);

    // 处理节日高亮显示
    const festStr = getFestival(monthStr, dayStr);

    // 带有闪烁冒号的时间 HTML
    const timeHtml = `${hours}<span class="blink">:</span>${minutes}`;

    // 利用类名，批量自动更新所有时钟组件 (左上角主时钟 和 侧栏时钟一起更新)
    document.querySelectorAll('.s-time').forEach(el => el.innerHTML = timeHtml);
    document.querySelectorAll('.s-date').forEach(el => el.textContent = dateStr);
    document.querySelectorAll('.s-lunar').forEach(el => el.textContent = lunarStr);
    document.querySelectorAll('.s-festival').forEach(el => el.textContent = festStr);
}

// 每隔 1000 毫秒（1秒）执行一次 updateTime 函数
setInterval(updateTime, 1000);
updateTime();