# 網頁加速器 Web Page Accelerator

## 描述 Description

這個擴充功能通過以下方式優化網頁效能：
This extension optimizes web page performance by:

1. 清除追蹤器 Clear Trackers:
   - Google Analytics 追蹤代碼 (Analytics tracking code)
   - Facebook 像素追蹤 (Pixel tracking)
   - 廣告追蹤腳本 (Ad tracking scripts)
   - 第三方統計工具 (Third-party analytics)

2. 優化資源載入 Resource Loading Optimization:
   - 延遲載入圖片 (Lazy loading images)
   - 移除非必要的 async/defer 腳本 (Remove non-essential async/defer scripts)
   - 優化 JavaScript 堆疊使用 (Optimize JavaScript heap usage)
   - 阻擋廣告請求 (Block ad requests)

3. 記憶體優化 Memory Optimization:
   - 清除未使用的 DOM 元素 (Clear unused DOM elements)
   - 優化圖片載入方式 (Optimize image loading)
   - 減少記憶體洩漏 (Reduce memory leaks)
   - 控制 JavaScript 堆疊大小 (Control JavaScript heap size)

## 權限說明 Permission Description

manifest.json 中的權限用途：
Permissions used in manifest.json:

- `webRequest`: 用於攔截和修改網路請求
  - Used to intercept and modify network requests
- `webRequestBlocking`: 用於阻擋追蹤器和廣告
  - Used to block trackers and advertisements
- `<all_urls>`: 允許在所有網站運作
  - Allows the extension to work on all websites
- `tabs`: 用於存取分頁資訊
  - Used to access tab information
- `storage`: 用於儲存設定和統計資料
  - Used to store settings and statistics
- `notifications`: 用於顯示優化完成通知
  - Used to display optimization completion notifications
- `activeTab`: 用於存取當前分頁
  - Used to access the current active tab
- `scripting`: 用於執行內容腳本
  - Used to execute content scripts

## 主要功能 Main Features

- `background.js`: 持續運行的背景程序，處理請求攔截
  - Background process that runs continuously to handle request interception
  - Manages tracking prevention and resource optimization
  - Maintains statistics for blocked trackers and optimized resources

- `popup.html`: 點擊工具列按鈕時顯示的彈出視窗
  - Popup window displayed when clicking the toolbar button
  - Shows optimization statistics and controls
  - Provides real-time feedback during optimization

- `popup.js`: 處理彈出視窗的互動邏輯
  - Handles popup window interactions
  - Manages optimization progress display
  - Updates statistics in real-time

- `create_icons.js`: 生成擴充功能圖示
  - Generates extension icons
  - Creates both 48x48 and 128x128 pixel versions
  - Uses Node.js Canvas for icon generation

## 功能特點 Features

1. 效能優化 Performance Optimization:
   - 移除不必要的腳本 Remove unnecessary scripts
   - 延遲載入圖片 Lazy load images
   - 減少記憶體使用 Reduce memory usage

2. 隱私保護 Privacy Protection:
   - 阻擋追蹤器 Block trackers
   - 過濾廣告請求 Filter ad requests
   - 保護用戶隱私 Protect user privacy

3. 使用者介面 User Interface:
   - 即時統計顯示 Real-time statistics display
   - 進度條回饋 Progress bar feedback
   - 優化結果報告 Optimization result report

## 技術實現 Technical Implementation

- 使用原生 JavaScript 開發
  - Developed using native JavaScript
- 採用 Chrome Extension API
  - Utilizes Chrome Extension API
- 支援所有主流網站
  - Supports all major websites

## 安裝方式 Installation

1. 開啟 Chrome 擴充功能頁面
   - Open Chrome Extensions page
2. 開啟開發者模式
   - Enable Developer mode
3. 載入未封裝項目
   - Load unpacked extension

## 使用方式 Usage

1. 點擊工具列圖示開啟控制面板
   - Click toolbar icon to open control panel
2. 點擊「立即優化」按鈕
   - Click "Optimize Now" button
3. 等待優化完成
   - Wait for optimization to complete
4. 查看優化結果
   - View optimization results 
"# Web-Accelerator01" 
