# QuickNav 快速導航元件

一個輕量級的頁面間快速導航元件，提供美觀的側邊抽屜式導航界面。

## 功能特點

- 簡單易用的頁面跳轉功能
- 可自定義導航項目、圖標和目標路徑
- 支持亮色/暗色主題
- 可自定義位置（左上、右上、左下、右下）
- 保留URL參數選項
- 當前頁面自動高亮顯示
- 響應式設計，支持各種設備
- 列印時自動隱藏

## 使用方法

1. 引入CSS和JS文件:
```html
<link rel="stylesheet" href="path/to/quicknav.css">
<script src="path/to/quicknav.js"></script>
```

2. 引入Font Awesome圖標庫:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
```

3. 初始化導航:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  QuickNav.init({
    // 可選配置
  });
});
```

## 配置選項

可以通過傳遞配置對象來自定義導航組件:

```javascript
QuickNav.init({
  targetPages: [
    { id: 'page1', name: '頁面1', icon: 'fa-home', path: '../page1/' },
    { id: 'page2', name: '頁面2', icon: 'fa-chart-bar', path: './page2/' }
  ],
  title: '導航菜單',
  triggerIcon: 'fa-bars',
  position: 'top-right',
  preserveParams: true,
  theme: 'dark' // 'light' 或 'dark'
});
``` 