/**
 * 圖示生成腳本
 * 用於生成擴充功能的圖示檔案
 * 需要 Node.js 環境和 canvas 套件
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// 創建 48x48 圖示
const canvas48 = createCanvas(48, 48);
const ctx48 = canvas48.getContext('2d');

// 繪製圖示背景 - 使用 Google 藍色
ctx48.fillStyle = '#4285f4';
ctx48.beginPath();
ctx48.arc(24, 24, 20, 0, Math.PI * 2);
ctx48.fill();

// 繪製閃電圖案 - 象徵快速優化
ctx48.fillStyle = '#ffffff';
ctx48.beginPath();
ctx48.moveTo(28, 15);
ctx48.lineTo(20, 24);
ctx48.lineTo(26, 24);
ctx48.lineTo(20, 33);
ctx48.lineTo(28, 24);
ctx48.lineTo(22, 24);
ctx48.closePath();
ctx48.fill();

// 將圖示儲存為 PNG 檔案
const buffer48 = canvas48.toBuffer('image/png');
fs.writeFileSync('icon48.png', buffer48);

// TODO: 使用相同方式創建 128x128 圖示 