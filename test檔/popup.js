/**
 * 彈出視窗腳本
 * 處理使用者介面互動和顯示優化結果
 */

document.addEventListener('DOMContentLoaded', function() {
    // 載入並顯示統計數據
    updateStats();
    
    // 每秒更新一次統計數據，保持即時性
    setInterval(updateStats, 1000);
  
    // 檢查是否有上次的優化結果並顯示
    chrome.storage.local.get(['lastOptimization'], function(result) {
      if (result.lastOptimization) {
        showOptimizationDetails(result.lastOptimization);
      }
    });
  
    // 立即優化按鈕
    document.getElementById('optimizeNow').addEventListener('click', function() {
      const button = this;
      const progressContainer = document.getElementById('progressContainer');
      const progressBar = document.getElementById('progressBar');
      const progressText = document.getElementById('progressText');
      
      // 顯示進度條
      button.disabled = true;
      button.style.display = 'none';
      progressContainer.style.display = 'block';
      progressBar.classList.add('progress-animate');
      
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 90) {
          progressBar.style.width = `${progress}%`;
          progressText.textContent = `優化中... ${progress}%`;
        }
      }, 100);
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          console.log('當前分頁:', tabs[0].url);
          
          // 檢查頁面類型並提供具體提示
          if (!tabs[0].url) {
            showError('無法存取此頁面，可能是瀏覽器內建頁面');
            return;
          }
          
          if (tabs[0].url.startsWith('chrome://')) {
            showError('無法優化瀏覽器內建頁面');
            return;
          }
          
          if (tabs[0].url.startsWith('chrome-extension://')) {
            showError('無法優化擴充功能頁面');
            return;
          }
          
          if (tabs[0].url.startsWith('file://')) {
            showError('無法優化本機檔案，請開啟網頁');
            return;
          }
  
          if (!tabs[0].url.startsWith('http')) {
            showError('不支援的頁面類型，請開啟一般網頁');
            return;
          }
          
          chrome.runtime.sendMessage({
            action: 'optimizeNow',
            tabId: tabs[0].id
          }, function(response) {
            clearInterval(progressInterval);
            
            if (chrome.runtime.lastError) {
              showError('優化過程發生錯誤：' + chrome.runtime.lastError.message);
              hideProgress();
              return;
            }
            
            if (response && response.success && response.optimizations) {
              // 完成進度條
              progressBar.style.width = '100%';
              progressText.textContent = '優化完成！';
              
              // 顯示優化結果
              console.log('優化成功:', response.optimizations);
              showOptimizationDetails(response.optimizations);
              
              // 延遲隱藏進度條
              setTimeout(hideProgress, 1000);
            } else {
              showError('優化失敗，請重新整理頁面後再試');
              hideProgress();
            }
          });
        } else {
          showError('找不到當前分頁，請確認分頁是否正常開啟');
          hideProgress();
        }
      });
    });
  
    // 重置按鈕
    document.getElementById('resetStats').addEventListener('click', function() {
      chrome.runtime.sendMessage({action: 'resetStats'}, function(response) {
        if (response.success) {
          updateStats();
          // 同時隱藏優化詳情
          document.getElementById('lastOptimization').style.display = 'none';
        }
      });
    });
  });
  
  /**
   * 更新統計數據顯示
   * 從 storage 讀取最新統計並更新 UI
   */
  function updateStats() {
    chrome.storage.local.get(['stats'], function(result) {
      if (result.stats) {
        document.getElementById('blockedCount').textContent = result.stats.blockedTrackers || 0;
        document.getElementById('optimizedImages').textContent = result.stats.optimizedImages || 0;
      }
    });
  }
  
  /**
   * 顯示優化詳細結果
   * @param {Object} optimizations - 優化結果物件
   */
  function showOptimizationDetails(optimizations) {
    console.log('顯示優化詳情:', optimizations);
    
    const details = document.getElementById('lastOptimization');
    details.style.display = 'block';
    
    // 更新詳細資訊
    document.getElementById('removedScripts').textContent = optimizations.scripts.length || 0;
    document.getElementById('optimizedImagesCount').textContent = optimizations.images.length || 0;
    
    // 轉換記憶體大小為 MB 並四捨五入到小數點後兩位
    const memorySavedMB = ((optimizations.memorySaved || 0) / (1024 * 1024)).toFixed(2);
    document.getElementById('memorySaved').textContent = memorySavedMB;
    
    // 顯示優化完成的時間
    document.getElementById('optimizationTime').textContent = optimizations.timestamp || '未知';
    
    // 顯示優化持續時間（確保有數值）
    const duration = optimizations.duration || 0;
    const durationInSeconds = (duration / 1000).toFixed(2);
    document.getElementById('optimizationDuration').textContent = durationInSeconds;
    
    // 修改按鈕顯示
    const button = document.getElementById('optimizeNow');
    button.style.display = 'block';
    button.disabled = false;
    button.textContent = `優化完成 ✓ (${durationInSeconds}秒)`;
    setTimeout(() => {
      button.textContent = '立即優化此頁面';
    }, 2000);
  }
  
  // 添加隱藏進度條的函數
  function hideProgress() {
    const button = document.getElementById('optimizeNow');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    
    button.disabled = false;
    button.style.display = 'block';
    progressContainer.style.display = 'none';
    progressBar.classList.remove('progress-animate');
    progressBar.style.width = '0%';
  }
  
  // 修改錯誤顯示函數
  function showError(message) {
    hideProgress();  // 確保進度條被隱藏
    
    const button = document.getElementById('optimizeNow');
    button.disabled = false;
    button.style.display = 'block';
    button.textContent = '立即優化此頁面';
    
    // 顯示錯誤訊息
    const details = document.getElementById('lastOptimization');
    details.style.display = 'block';
    details.innerHTML = `
      <div class="error-message">
        <h4>無法優化</h4>
        <p>${message}</p>
        <div class="suggestion">
          建議操作：
          <ul>
            <li>請開啟一般網頁（例如：新聞網站、部落格等）</li>
            <li>重新整理目前頁面後再試</li>
            <li>確認網頁是否正常載入完成</li>
          </ul>
        </div>
      </div>
    `;
  } 