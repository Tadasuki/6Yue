// ====================
//   真实新闻流 RSS
// ====================

function fetchNews() {
    const newsList = document.getElementById('news-list');

    // 1. 暂时显示加载中提示
    newsList.innerHTML = '<p style="text-align:center; color:#718096; padding: 20px; font-family: var(--font-oppo);">正在抓取最新资讯...</p>';

    // 2. 定义多家高质量国际媒体的 RSS 源
    const rssFeeds = [
        'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml', // BBC 中文网
        'https://cn.nytimes.com/rss/',                    // 纽约时报中文网
        'https://crossing.cw.com.tw/rss',                 // 換日線Crossing (深度报道与分析)
        'https://feedx.net/rss/chosun.xml',               // 朝鲜日报
        'https://feedx.net/rss/rci.xml',                  // 加拿大广播电台
        'https://feedx.net/rss/dw.xml',                   // 德国之声
        'https://www.solidot.org/index.rss',              // 奇客 Solidot (高质量极客科技资讯)
        'https://cn.engadget.com/rss.xml',                // 瘾科技 Engadget 中文版
        'https://feeds.feedburner.com/ruanyifeng',        // 阮一峰的网络日志 (技术与时事兼顾)
        'https://sspai.com/feed',                         // 少数派 (科技与文化深度报道)
        'http://feed.appinn.com/',                        // 小众软件 (实用工具与科技资讯)
        'https://new.shuge.org/feed/'                     // 书格 (文化与历史资讯)
    ];

    // 利用 Promise.all 并发获取所有新闻源
    const fetchPromises = rssFeeds.map(feedUrl => {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        return fetch(apiUrl).then(response => response.json());
    });

    Promise.all(fetchPromises)
        .then(results => {
            newsList.innerHTML = ''; // 清空加载提示
            let allItems = [];

            // 整合抓取到的所有新闻数据
            results.forEach(data => {
                if (data.status === 'ok') {
                    allItems = allItems.concat(data.items);
                }
            });

            // 核心逻辑：按新闻发布时间(pubDate)降序排序，实现两家媒体自然交替穿插
            allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            // 截取合并排序后的最新 30 条新闻，确保有看不完的流
            const topItems = allItems.slice(0, 100);

            topItems.forEach((item, index) => {
                let imageUrl = '';

                if (item.thumbnail) {
                    imageUrl = item.thumbnail;
                } else if (item.enclosure && item.enclosure.link) {
                    imageUrl = item.enclosure.link;
                } else {
                    // 很多优质媒体图片藏在正文(content)里，不仅检索 description 还要检索 content
                    const htmlContent = (item.content || '') + (item.description || '');
                    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
                    if (imgMatch) {
                        imageUrl = imgMatch[1];
                    } else {
                        // 兜底：无图则调用 Canvas 引擎，根据标题瞬间在本地渲染出优雅的粗体文字背景图
                        imageUrl = generateFallbackImage(item.title);
                    }
                }

                // 提取部分描述文字，清除 HTML 标签与多余的空格换行
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description;
                let plainText = tempDiv.textContent || tempDiv.innerText || '';
                plainText = plainText.replace(/\s+/g, ' ').trim(); // 清理排版
                if (!plainText) plainText = '点击阅读来自顶尖媒体的深度报道内容...';

                // 动态生成新闻图文卡片的 HTML
                const html = `
                        <li class="news-card">
                            <a href="${item.link}" target="_blank">
                                <img src="${imageUrl}" alt="新闻封面" loading="lazy">
                                <div class="news-content">
                                    <h4>${item.title}</h4>
                                    <p>${plainText.substring(0, 65)}...</p>
                                </div>
                            </a>
                        </li>
                    `;
                newsList.insertAdjacentHTML('beforeend', html);
            })
        })
        .catch(error => console.error('获取新闻失败:', error));
}

// 网页刚打开时立刻执行一次抓取
fetchNews();

// 每隔一小时 (3600000 毫秒) 自动刷新一次新闻流
setInterval(fetchNews, 3600000);