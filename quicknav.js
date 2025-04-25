/**
 * QuickNav - 快速跳轉模組
 * 一個方便的導航模組，可以在不同頁面間快速跳轉
 * 
 * @version 1.0.0
 */

const QuickNav = (function() {
  // 預設配置
  const defaultConfig = {
    targetPages: [
      { id: 'vocabnote', name: '字彙筆記', icon: 'fa-book-open', path: '../vocabNote/' },
      { id: 'vocabprint', name: '字彙列印', icon: 'fa-print', path: './vocabPrint/' },
      { id: 'vocabloop', name: '字彙迴憶', icon: 'fa-infinity', path: '../vocabLoop/' },
      //{ id: 'vocabspeak', name: '字彙口說', icon: 'fa-microphone', path: '../vocabSpeak/' }
    ],
    title: '跳轉捷徑',
    triggerIcon: 'fa-compass',
    position: 'top-left',
    zIndex: {
      trigger: 1001,
      drawer: 1002,
      overlay: 1000
    },
    preserveParams: true,
    theme: 'light' // 'light' 或 'dark'
  };

  // 模組內部狀態
  let config = {};
  let elements = {};
  let isInitialized = false;

  // 私有方法: 創建DOM元素
  function createElements() {
    // 創建觸發按鈕
    const trigger = document.createElement('div');
    trigger.className = 'qn-trigger';
    trigger.id = 'qn-trigger';
    trigger.innerHTML = `<i class="fas ${config.triggerIcon}"></i>`;
    document.body.appendChild(trigger);

    // 創建抽屜
    const drawer = document.createElement('div');
    drawer.className = `qn-drawer ${config.theme === 'dark' ? 'qn-dark' : ''}`;
    drawer.id = 'qn-drawer';
    document.body.appendChild(drawer);

    // 創建覆蓋層
    const overlay = document.createElement('div');
    overlay.className = 'qn-overlay';
    overlay.id = 'qn-overlay';
    document.body.appendChild(overlay);

    // 設置抽屜內容
    drawer.innerHTML = `
      <div class="qn-header">
        <h3>${config.title}</h3>
        <button class="qn-close" id="qn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="qn-content" id="qn-content">
        ${generateNavItems()}
      </div>
    `;

    // 保存元素引用
    elements = {
      trigger: trigger,
      drawer: drawer,
      overlay: overlay,
      close: document.getElementById('qn-close'),
      content: document.getElementById('qn-content')
    };

    // 設置位置
    setPosition();
  }

  // 私有方法: 根據配置設置位置
  function setPosition() {
    switch(config.position) {
      case 'top-left':
        elements.trigger.style.top = '20px';
        elements.trigger.style.left = '-5px';
        break;
      case 'top-right':
        elements.trigger.style.top = '20px';
        elements.trigger.style.right = '-5px';
        elements.trigger.style.left = 'auto';
        break;
      case 'bottom-left':
        elements.trigger.style.bottom = '20px';
        elements.trigger.style.left = '-5px';
        elements.trigger.style.top = 'auto';
        break;
      case 'bottom-right':
        elements.trigger.style.bottom = '20px';
        elements.trigger.style.right = '-5px';
        elements.trigger.style.top = 'auto';
        elements.trigger.style.left = 'auto';
        break;
    }
  }

  // 私有方法: 生成導航項目HTML
  function generateNavItems() {
    return config.targetPages.map(page => {
      return `<div class="qn-item" data-target="${page.id}">
        <i class="fas ${page.icon}"></i>
        <span>${page.name}</span>
      </div>`;
    }).join('');
  }

  // 私有方法: 設置事件監聽
  function setupEventListeners() {
    // 開啟抽屜
    elements.trigger.addEventListener('click', openDrawer);
    
    // 關閉抽屜
    elements.close.addEventListener('click', closeDrawer);
    elements.overlay.addEventListener('click', closeDrawer);
    
    // 點擊項目導航
    const navItems = document.querySelectorAll('.qn-item');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        navigateTo(target);
        closeDrawer();
      });
    });

    // 按 ESC 鍵關閉抽屜
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && elements.drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  // 私有方法: 開啟抽屜
  function openDrawer() {
    elements.drawer.classList.add('open');
    elements.overlay.classList.add('visible');
    // 防止背景滾動
    document.body.style.overflow = 'hidden';
  }

  // 私有方法: 關閉抽屜
  function closeDrawer() {
    elements.drawer.classList.remove('open');
    elements.overlay.classList.remove('visible');
    // 恢復背景滾動
    document.body.style.overflow = '';
  }

  // 私有方法: 檢測當前頁面
  function detectCurrentPage() {
    // 獲取當前頁面路徑
    const currentPath = window.location.pathname;
    // 從路徑中提取文件夾或文件名
    const pathParts = currentPath.split('/');
    let fileName = '';
    
    // 嘗試獲取有意義的路徑部分
    for (let i = pathParts.length - 1; i >= 0; i--) {
      if (pathParts[i]) {
        fileName = pathParts[i];
        break;
      }
    }
    
    // 標記當前頁面
    let currentTarget = '';
    config.targetPages.forEach(page => {
      // 檢查路徑是否匹配目標頁面
      const pageId = page.id.toLowerCase();
      if (fileName.toLowerCase().includes(pageId)) {
        currentTarget = page.id;
      }
    });
    
    // 移除所有當前標記
    document.querySelectorAll('.qn-item').forEach(item => {
      item.classList.remove('current');
    });
    
    // 標記當前頁面
    if (currentTarget) {
      const currentItem = document.querySelector(`.qn-item[data-target="${currentTarget}"]`);
      if (currentItem) {
        currentItem.classList.add('current');
      }
    }
  }

  // 私有方法: 頁面跳轉
  function navigateTo(target) {
    // 獲取目標頁面配置
    const targetPage = config.targetPages.find(page => page.id === target);
    if (!targetPage) {
      console.warn('未知的跳轉目標:', target);
      return;
    }
    
    // 構建URL
    let targetUrl = targetPage.path;
    
    // 保留URL參數
    if (config.preserveParams) {
      const urlParams = new URLSearchParams(window.location.search);
      const paramStr = urlParams.toString();
      if (paramStr) {
        targetUrl += targetUrl.includes('?') ? `&${paramStr}` : `?${paramStr}`;
      }
    }
    
    // 執行頁面跳轉
    window.location.href = targetUrl;
  }

  // 公開方法: 初始化
  function init(userConfig = {}) {
    if (isInitialized) {
      console.warn('QuickNav已經初始化過了');
      return;
    }
    
    // 合併配置
    config = {...defaultConfig, ...userConfig};
    
    // 若用戶提供了targetPages，完全覆蓋預設值
    if (userConfig.targetPages) {
      config.targetPages = userConfig.targetPages;
    }
    
    // 若用戶提供了zIndex的部分值，合併它們
    if (userConfig.zIndex) {
      config.zIndex = {...defaultConfig.zIndex, ...userConfig.zIndex};
    }
    
    // 加載CSS
    loadCSS();
    
    // 創建DOM元素
    createElements();
    
    // 設置事件監聽
    setupEventListeners();
    
    // 檢測當前頁面
    detectCurrentPage();
    
    isInitialized = true;
  }

  // 私有方法: 加載CSS
  function loadCSS() {
    // 檢查是否已經載入
    if (document.getElementById('quicknav-css')) {
      return;
    }
    
    // 從當前腳本位置推測CSS路徑
    const scripts = document.getElementsByTagName('script');
    let scriptPath = '';
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes('quicknav.js')) {
        scriptPath = scripts[i].src.substring(0, scripts[i].src.lastIndexOf('/') + 1);
        break;
      }
    }
    
    // 創建並添加CSS連結
    const link = document.createElement('link');
    link.id = 'quicknav-css';
    link.rel = 'stylesheet';
    link.href = scriptPath + 'quicknav.css';
    document.head.appendChild(link);
  }

  // 公開方法: 更新配置
  function updateConfig(newConfig) {
    if (!isInitialized) {
      console.warn('請先初始化 QuickNav');
      return;
    }
    
    // 合併新配置
    config = {...config, ...newConfig};
    
    // 重新載入DOM
    elements.trigger.remove();
    elements.drawer.remove();
    elements.overlay.remove();
    
    // 重新創建DOM元素
    createElements();
    
    // 重新設置事件監聽
    setupEventListeners();
    
    // 重新檢測當前頁面
    detectCurrentPage();
  }

  // 公開API
  return {
    init: init,
    updateConfig: updateConfig
  };
})(); 