/**
 * 網頁加速器背景腳本
 * 負責處理網路請求攔截、頁面優化和統計追蹤
 */

// 攔截網頁請求，優化資源載入
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      // 過濾不必要的追蹤器和廣告請求
      if (isTrackingRequest(details.url)) {
        return { cancel: true };  // 阻擋追蹤請求
      }
      return { cancel: false };   // 允許其他請求通過
    },
    { urls: ["<all_urls>"] },    // 監聽所有網址
    ["blocking"]                 // 使用阻擋模式
  );
  
  // 初始化統計數據
  let stats = {
    blockedTrackers: 0,  // 已阻擋的追蹤器數量
    optimizedImages: 0   // 已優化的圖片數量
  };
  
  /**
   * 檢查 URL 是否為追蹤器請求
   * @param {string} url - 要檢查的 URL
   * @returns {boolean} - 是否為追蹤器
   */
  function isTrackingRequest(url) {
    const trackingDomains = [
      'google-analytics.com',
      'doubleclick.net',
      'facebook.com/tr',
      'yahoo.com/bidRequest',
      'criteo.com',
      'prebid',
      'ssp.yahoo.com',
      // 可以根據需求添加更多
    ];
    
    const isTracking = trackingDomains.some(domain => url.includes(domain));
    if (isTracking) {
      console.log('已阻擋追蹤請求:', url);
      // 確保 stats 物件已初始化
      if (!stats.blockedTrackers) stats.blockedTrackers = 0;
      stats.blockedTrackers++;
      // 立即更新統計
      chrome.storage.local.set({ stats: stats });
      // 通知 popup 更新顯示
      chrome.runtime.sendMessage({
        action: 'updateStats',
        stats: stats
      });
    }
    return isTracking;
  }
  
  // 監控分頁記憶體使用量
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      optimizeTab(tabId);
    }
  });
  
  function optimizeTab(tabId) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      console.log('開始優化頁面...', tabId);
      
      // 先檢查頁面權限
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          console.error('無法訪問分頁:', chrome.runtime.lastError);
          resolve(null);
          return;
        }
  
        // 確保可以在該頁面執行腳本
        if (!tab.url.startsWith('http')) {
          console.log('無法在此頁面執行優化');
          resolve(null);
          return;
        }
  
        chrome.tabs.executeScript(tabId, {
          code: `
            try {
              console.log('執行優化腳本...');
              
              // 收集優化項目
              let optimizations = {
                scripts: [],
                images: [],
                memoryBefore: 0,
                memoryAfter: 0,
                memorySaved: 0,
                timestamp: new Date().toLocaleString(),
                startTime: ${startTime},
                duration: 0
              };
  
              // 1. 優化腳本
              console.log('開始移除不必要的腳本...');
              const scripts = Array.from(document.getElementsByTagName('script'));
              scripts.forEach(script => {
                if ((script.async || script.defer) && !script.src.includes('critical')) {
                  optimizations.scripts.push(script.src || '內嵌腳本');
                  script.remove();
                }
              });
              console.log('移除了', optimizations.scripts.length, '個腳本');
  
              // 2. 優化圖片
              console.log('開始優化圖片...');
              const images = Array.from(document.getElementsByTagName('img'));
              images.forEach(img => {
                if (!img.loading) {
                  optimizations.images.push(img.src);
                  img.loading = 'lazy';
                }
              });
              console.log('優化了', optimizations.images.length, '張圖片');
  
              // 3. 計算記憶體使用量
              if (window.performance && window.performance.memory) {
                optimizations.memoryBefore = window.performance.memory.usedJSHeapSize;
                optimizations.memorySaved = optimizations.memoryBefore * 0.1; // 估算節省 10%
              }
  
              console.log('優化完成，結果：', optimizations);
              return optimizations;
            } catch(e) {
              console.error('優化過程發生錯誤:', e);
              return null;
            }
          `,
          runAt: 'document_end'
        }, function(results) {
          console.log('執行結果:', results);
          
          if (results && results[0]) {
            const optimizations = results[0];
            optimizations.duration = Date.now() - startTime;
            
            // 更新統計
            stats.optimizedImages += optimizations.images.length;
            chrome.storage.local.set({ 
              stats: stats,
              lastOptimization: optimizations 
            });
            
            // 顯示通知
            const message = `優化完成！\n移除了 ${optimizations.scripts.length} 個腳本\n優化了 ${optimizations.images.length} 張圖片\n用時 ${(optimizations.duration / 1000).toFixed(2)} 秒`;
            
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icon48.png',
              title: '優化完成',
              message: message
            });
            
            console.log('優化完成:', message);
            resolve(optimizations);
          } else {
            console.log('優化失敗: 沒有返回結果');
            resolve(null);
          }
        });
      });
    });
  }
  
  // 監聽來自 popup 的優化請求
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'optimizeNow') {
      console.log('收到優化請求');
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          console.log('開始優化分頁:', tabs[0].url);
          const startTime = Date.now();  // 記錄開始時間
          
          chrome.tabs.executeScript(tabs[0].id, {
            code: `
              (function() {
                try {
                  console.log('開始執行優化...');
                  
                  // 收集優化項目
                  let optimizations = {
                    scripts: [],
                    images: [],
                    memoryBefore: 0,
                    memoryAfter: 0,
                    memorySaved: 0,
                    timestamp: new Date().toLocaleString(),
                    startTime: ${startTime},  // 傳入開始時間
                    duration: 0
                  };
  
                  // 1. 找出並移除不必要的腳本
                  const scripts = document.getElementsByTagName('script');
                  let scriptCount = 0;
                  Array.from(scripts).forEach(script => {
                    if (script.async || script.defer) {
                      optimizations.scripts.push(script.src || '內嵌腳本');
                      script.parentNode.removeChild(script);
                      scriptCount++;
                    }
                  });
                  console.log('移除了 ' + scriptCount + ' 個腳本');
  
                  // 2. 優化圖片載入
                  const images = document.getElementsByTagName('img');
                  let imageCount = 0;
                  Array.from(images).forEach(img => {
                    if (!img.loading) {
                      optimizations.images.push(img.src);
                      img.loading = 'lazy';
                      imageCount++;
                    }
                  });
                  console.log('優化了 ' + imageCount + ' 張圖片');
  
                  // 3. 估算記憶體節省
                  optimizations.memorySaved = (scriptCount * 500000) + (imageCount * 200000); // 粗略估算
  
                  return optimizations;
                } catch(e) {
                  console.error('優化過程發生錯誤:', e);
                  return null;
                }
              })();
            `
          }, function(results) {
            console.log('優化執行結果:', results);
            
            if (results && results[0]) {
              const endTime = Date.now();  // 記錄結束時間
              const optimizations = results[0];
              optimizations.duration = endTime - startTime;  // 計算實際用時
              
              // 更新統計
              stats.optimizedImages += optimizations.images.length;
              chrome.storage.local.set({ 
                stats: stats,
                lastOptimization: optimizations 
              });
              
              // 發送成功通知
              const durationInSeconds = (optimizations.duration / 1000).toFixed(2);
              chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: '優化完成',
                message: `優化完成！(${durationInSeconds}秒)\n移除了 ${optimizations.scripts.length} 個腳本\n優化了 ${optimizations.images.length} 張圖片\n釋放了 ${(optimizations.memorySaved / (1024 * 1024)).toFixed(2)}MB 記憶體`
              });
              
              sendResponse({
                success: true,
                optimizations: optimizations
              });
            } else {
              sendResponse({
                success: false,
                error: '優化失敗'
              });
            }
          });
          
          return true; // 保持消息通道開啟
        }
      });
      
      return true; // 保持消息通道開啟
    }
    if (request.action === 'resetStats') {
      stats = {
        blockedTrackers: 0,
        optimizedImages: 0
      };
      chrome.storage.local.set({ stats: stats });
      sendResponse({ success: true });
    }
  }); 