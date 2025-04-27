class VocabExportAppElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._initialized = false;
    }
  
    connectedCallback() {
      // Initialize only once
      if (this._initialized) return;
      this._initialized = true;
  
      // Load external resources and initialize the app
      this.loadResourcesAndInit();
    }
  
    loadResourcesAndInit() {
      const shadow = this.shadowRoot;
  
      // Promise-based resource loading
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          shadow.appendChild(script);
        });
      };
  
      const loadStyle = (href) => {
        return new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.onload = resolve;
          link.onerror = reject;
          shadow.appendChild(link);
        });
      };
  
      // Load CSS first
      Promise.all([
        loadStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'),
      ])
      .then(() => {
        // Inject Tailwind script (it applies styles immediately)
        const tailwindScript = document.createElement('script');
        tailwindScript.src = 'https://cdn.tailwindcss.com';
        shadow.appendChild(tailwindScript);
  
        // Inject HTML and internal CSS
        this.renderBaseHTML();
  
        // Load JS libraries sequentially to ensure dependencies (like JSZip for the app)
        return loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js');
      })
      .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'))
      .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'))
      .then(() => {
        // Now all libraries are loaded, initialize the app logic
        this.initializeAppLogic();
      })
      .catch(error => {
        console.error("Failed to load resources for VocabExportApp:", error);
        shadow.innerHTML = `<p style="color: red; padding: 20px;">Error loading resources. Please check the console.</p>`;
      });
    }
  
    renderBaseHTML() {
      const shadow = this.shadowRoot;
      shadow.innerHTML += `
        <style>
          /* Styles copied from VocabExport.html */
          :root {
            /* Define CSS variables scoped to the shadow DOM */
            --primary-color: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #818cf8;
            --danger-color: #ef4444;
            --danger-dark: #dc2626;
            --danger-light: #f87171;
            --text-light: #f8fafc;
            --text-dark: #1e293b;
            --text-primary: #334155;
            --text-secondary: #64748b;
            --bg-primary: #f1f5f9;
            --bg-card: #ffffff;
            --border-color: #e2e8f0;
            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --spacing-xs: 4px;
            --spacing-sm: 8px;
            --spacing-md: 12px;
            --spacing-lg: 16px;
            --spacing-xl: 24px;
            --spacing-2xl: 32px;
            --border-radius-sm: 4px;
            --border-radius-md: 6px;
            --border-radius-lg: 8px;
            --border-radius-xl: 12px;
            --border-radius-full: 9999px;
            --font-size-xs: 0.75rem;
            --font-size-sm: 0.875rem;
            --font-size-base: 1rem;
            --font-size-lg: 1.125rem;
            --font-size-xl: 1.25rem;
            --font-size-2xl: 1.5rem;
            --transition-fast: all 0.2s ease-in-out;
            --transition: all 0.3s ease;
            --sidebar-width: 260px;
          }
  
          /* Reset/Base styles scoped to :host */
          :host {
            display: block; /* Ensure the host element takes up space */
            font-family: 'Noto Sans TC', sans-serif; /* Apply default font */
            background-color: var(--bg-primary); /* Apply body background */
            min-height: 100vh;
            line-height: 1.6;
          }
  
          *, *::before, *::after {
            box-sizing: border-box;
          }
  
          /* Styles originally applied to html/body */
          /* Using :host selector for web component root */
          :host {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: var(--text-primary);
          }
  
          /* Main layout within the Shadow DOM */
          .vocab-export-wrapper {
              display: flex;
              min-height: inherit; /* Inherit min-height from :host */
          }
  
          /* --- Paste all other CSS rules from VocabExport.html here --- */
          /* Make sure selectors don't rely on \`body\` or \`html\` tags */
          /* Example: change \`body\` to \`.vocab-export-wrapper\` or a more specific container */
  
          /* Left Sidebar Styles */
          .sidebar {
            width: var(--sidebar-width);
            background: var(--bg-card);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-lg);
            position: fixed; /* Keep fixed positioning relative to viewport */
            height: 100vh;
            overflow-y: auto;
            border-right: 1px solid var(--border-color);
            z-index: 10;
          }
  
          .sidebar-header {
            padding: var(--spacing-lg);
            margin-bottom: var(--spacing-lg);
            border-bottom: 1px solid var(--border-color);
          }
  
          .sidebar-header h1 {
            font-size: var(--font-size-xl);
            color: var(--primary-color);
            margin: 0;
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-weight: 700; /* Bold title */
          }
  
          .nav-menu {
            list-style: none;
            padding: 0;
            margin: 0;
          }
  
          .nav-item {
            margin-bottom: var(--spacing-sm);
          }
  
          .nav-link {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-md) var(--spacing-lg);
            color: var(--text-secondary);
            text-decoration: none;
            border-radius: var(--border-radius-md); /* Slightly smaller radius */
            transition: var(--transition-fast);
            font-weight: 500;
          }
  
          .nav-link:hover {
            background: rgba(99, 102, 241, 0.08); /* Subtle hover */
            color: var(--primary-dark);
          }
  
          .nav-link.active {
            background: var(--primary-color);
            color: var(--text-light);
            box-shadow: var(--shadow-sm);
          }
  
          .nav-link.active:hover {
             background: var(--primary-dark);
          }
  
          .nav-link i {
            width: 20px;
            text-align: center;
            font-size: var(--font-size-base); /* Match text size */
          }
  
          /* Main Content Area Styles */
          .main-content {
            flex: 1;
            margin-left: var(--sidebar-width); /* This needs adjustment if sidebar isn't fixed */
            padding: var(--spacing-2xl); /* More padding */
            min-height: 100vh;
          }
  
          /* Content Section Switching */
          .content-section {
            display: none;
            animation: fadeIn 0.5s ease forwards; /* Fade-in animation */
          }
  
          .content-section.active {
            display: block;
          }
  
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
  
          .container {
            max-width: 1200px; /* Added max-width for larger screens */
            width: 100%;
            margin: 0 auto; /* Center container */
            padding: 0;
          }
  
          /* General Header Styles */
          .header {
            text-align: center;
            margin-bottom: var(--spacing-2xl); /* Increased spacing */
          }
  
          .header h1 {
            font-size: var(--font-size-2xl); /* Larger title */
            color: var(--primary-dark); /* Darker color */
            margin-bottom: var(--spacing-sm); /* Reduced spacing */
            display: flex;
            align-items: center;
            justify-content: center; /* Center icon and text */
            gap: var(--spacing-md);
            font-weight: 700;
          }
  
          .header p {
            color: var(--text-secondary);
            font-size: var(--font-size-base);
            margin-bottom: var(--spacing-xl);
            max-width: 600px; /* Limit description width */
            margin-left: auto;
            margin-right: auto;
          }
  
          /* Usage Steps Styles */
          .usage-steps {
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-xl);
            margin-bottom: var(--spacing-xl);
            border: 1px solid var(--border-color);
          }
  
          .usage-steps h2 {
            color: var(--primary-dark);
            margin-bottom: var(--spacing-lg);
            font-size: var(--font-size-lg);
            font-weight: 700;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: var(--spacing-md);
            /* Added flex for toggle icon alignment */
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
          }
  
          .steps {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            /* Added for toggle */
            /* display: none; Initially hidden */
          }
  
          .step {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md);
          }
  
          .step-number {
            background: var(--primary-light);
            color: var(--primary-dark);
            width: 28px; /* Larger number circle */
            height: 28px;
            border-radius: var(--border-radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--font-size-sm);
            font-weight: 700;
            flex-shrink: 0;
          }
  
          .step-content {
            color: var(--text-primary); /* Darker text */
            padding-top: 2px;
          }
  
          /* Unified Button Styles */
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-md) var(--spacing-lg); /* Adjusted padding */
            font-size: var(--font-size-base);
            font-weight: 500;
            border-radius: var(--border-radius-md);
            border: 1px solid transparent; /* Base border */
            cursor: pointer;
            transition: var(--transition-fast);
            text-decoration: none;
            box-shadow: var(--shadow-sm);
            white-space: nowrap; /* Prevent wrapping */
          }
  
          .btn i {
            font-size: 1.1em; /* Slightly larger icons */
          }
  
          .btn:focus-visible {
              outline: 2px solid var(--primary-light);
              outline-offset: 2px;
          }
  
          .btn-primary {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: var(--text-light);
          }
  
          .btn-primary:hover {
            background: var(--primary-dark);
            border-color: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }
  
          .btn-secondary {
            background: var(--bg-card);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
          }
  
          .btn-secondary:hover {
            background: var(--bg-primary);
            border-color: #cbd5e1; /* Slightly darker border on hover */
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }
  
          .btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
              background: var(--text-secondary) !important; /* Ensure disabled style overrides */
              border-color: var(--text-secondary) !important;
          }
  
          /* Unified Input Styles */
          .input, .label-input, .bulk-input, .word-input {
            width: 100%;
            padding: var(--spacing-md) var(--spacing-lg);
            font-size: var(--font-size-base);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-md);
            background: var(--bg-card);
            color: var(--text-primary);
            transition: var(--transition-fast);
            outline: none;
          }
  
          .input:focus, .label-input:focus, .bulk-input:focus, .word-input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          }
  
          .input::placeholder, .label-input::placeholder, .bulk-input::placeholder, .word-input::placeholder {
            color: var(--text-secondary);
            opacity: 0.8;
          }
  
          /* Unified Card Styles */
          .card {
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-lg);
            transition: var(--transition-fast);
            border: 1px solid var(--border-color);
          }
  
          .card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-2px);
          }
  
          /* Specific Element Adjustments */
          .label-input-container {
            display: flex;
            gap: var(--spacing-md); /* Reduced gap */
            margin-bottom: var(--spacing-xl);
            align-items: center;
          }
  
          .label-input {
            flex-grow: 1; /* Allow input to grow */
          }
  
          /* Loading Indicator */
          /* Needs to be appended to the light DOM or a top-level element */
          /* We'll handle this in JS by appending to document.body if needed */
          #loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8); /* Lighter background */
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: none; /* Initial state */
            justify-content: center;
            align-items: center;
            z-index: 1999;
          }
  
          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
            color: var(--text-dark); /* Dark text */
            font-size: var(--font-size-lg);
            font-weight: 500;
            background-color: var(--bg-card);
            padding: var(--spacing-xl) var(--spacing-2xl);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
          }
  
          .loading-content i {
            color: var(--primary-color);
            font-size: 2rem;
          }
  
          /* Word Wall Generation Styles (for html2canvas, needs careful handling) */
          /* This temporary container will be created OUTSIDE the shadow DOM for html2canvas */
          .word-wall-container {
            width: 1920px;
            height: 1080px;
            position: relative; /* Changed from fixed */
            /* Removed position: fixed, left, top */
            /* Needs to be appended outside shadow DOM for html2canvas */
            display: grid;
            padding: 40px;
            box-sizing: border-box;
            place-items: center;
            gap: 10px;
            transition: background 0.3s ease;
            /* Will be styled further in JS before capture */
          }
  
          .word-wall-word {
            /* Styles for generated image - mostly kept as is */
            background-color: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 15px 20px;
            border-radius: var(--border-radius-md);
            font-weight: 600;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            min-height: 60px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            letter-spacing: 0.5px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
  
          .word-wall-title {
            position: absolute;
            top: 30px; /* Increased spacing */
            left: 0;
            right: 0;
            text-align: center;
            color: #ffffff;
            font-size: 32px; /* Larger title */
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); /* Stronger shadow */
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-md);
          }
  
          .word-wall-footer {
            position: absolute;
            bottom: 30px; /* Increased spacing */
            left: 0;
            right: 0;
            text-align: center;
            color: rgba(255, 255, 255, 0.6); /* Slightly more visible */
            font-size: 18px; /* Larger footer */
          }
  
          .wall-word-en {
            display: block;
            font-weight: 600;
            width: 100%;
          }
  
          .wall-word-cn {
            display: block;
            opacity: 0.85;
            margin-top: var(--spacing-xs); /* Small gap */
            width: 100%;
            white-space: normal;
            line-height: 1.3; /* Slightly tighter */
            font-weight: normal;
            font-size: 0.8em; /* Relative size */
          }
  
          /* Word Wall Modal Styles */
          /* Modals need to be appended to the light DOM (document.body) */
          .word-wall-modal {
            position: fixed;
            inset: 0; /* Replaces top, left, right, bottom */
            background-color: rgba(0, 0, 0, 0.85);
            z-index: 2000; /* High z-index */
            display: flex; /* Use flex for centering */
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-lg);
            overflow: auto;
            animation: fadeIn 0.3s ease forwards;
          }
  
          .word-wall-modal-content {
            max-width: 90%;
            max-height: 90vh; /* Use viewport height */
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg);
            background-color: var(--bg-card); /* Add background */
            padding: var(--spacing-lg);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-lg);
          }
  
          .word-wall-preview {
            max-width: 100%;
            max-height: calc(80vh - 100px); /* Adjust based on controls height */
            object-fit: contain;
            border-radius: var(--border-radius-md);
            border: 1px solid var(--border-color); /* Add subtle border */
          }
  
          .word-wall-modal-controls {
            display: flex;
            gap: var(--spacing-md);
            justify-content: center;
            padding-top: var(--spacing-lg);
            border-top: 1px solid var(--border-color); /* Separator line */
          }
  
          .btn-download {
            /* Inherits .btn styles */
            padding: var(--spacing-md) var(--spacing-xl);
            font-size: var(--font-size-base);
            border-radius: var(--border-radius-md);
            background: var(--primary-color);
            color: var(--text-light);
          }
          .btn-download:hover {
            background: var(--primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }
  
          .btn-close {
            /* Inherits .btn styles */
             padding: var(--spacing-md) var(--spacing-lg);
             border-radius: var(--border-radius-md);
             background: var(--bg-card);
             color: var(--text-primary);
             border: 1px solid var(--border-color);
          }
          .btn-close:hover {
             background: var(--bg-primary);
             border-color: #cbd5e1;
             transform: translateY(-1px);
             box-shadow: var(--shadow-sm);
          }
  
          /* Theme Selector Styles */
          .theme-selector {
            background: var(--bg-card);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-md);
            margin-top: var(--spacing-xl);
            margin-bottom: var(--spacing-xl);
            border: 1px solid var(--border-color);
            overflow: hidden; /* Contain children */
          }
  
          .theme-selector-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: var(--spacing-lg); /* Consistent padding */
          }
  
          .theme-selector-header h2 {
            color: var(--primary-dark);
            margin: 0;
            font-size: var(--font-size-lg);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-weight: 700;
          }
  
          .theme-selector-header i.fa-chevron-down { /* Target chevron specifically */
            transition: transform var(--transition-fast);
            color: var(--text-secondary);
          }
  
          .theme-selector-header.collapsed i.fa-chevron-down {
            transform: rotate(-90deg);
          }
  
          .themes {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Slightly smaller minmax */
            gap: var(--spacing-lg);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease, padding 0.4s ease; /* Smooth transition */
            padding: 0 var(--spacing-lg); /* Add horizontal padding */
          }
  
          .themes.expanded {
            max-height: 500px; /* Adjust as needed */
            padding: var(--spacing-lg); /* Apply padding when expanded */
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-light) var(--bg-primary);
          }
  
          /* Custom Scrollbar */
          .themes.expanded::-webkit-scrollbar {
            width: 8px;
          }
          .themes.expanded::-webkit-scrollbar-track {
            background: var(--bg-primary);
            border-radius: 4px;
          }
          .themes.expanded::-webkit-scrollbar-thumb {
            background-color: var(--primary-light);
            border-radius: 4px;
          }
          .themes.expanded::-webkit-scrollbar-thumb:hover {
            background-color: var(--primary-color);
          }
  
          /* Theme Option Styles */
          .theme-option {
            background: var(--bg-card);
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-sm);
            cursor: pointer;
            padding: var(--spacing-sm);
            border: 2px solid transparent;
            transition: var(--transition-fast);
            text-align: center;
          }
  
          .theme-option:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            border-color: var(--primary-light);
          }
  
          .theme-option.selected {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3), var(--shadow-sm);
          }
  
          .theme-preview {
            width: 100%;
            height: 60px;
            border-radius: var(--border-radius-sm);
            margin-bottom: var(--spacing-sm);
            border: 1px solid var(--border-color);
          }
  
          .theme-name {
            font-weight: 500;
            color: var(--text-primary);
            font-size: var(--font-size-sm);
          }
  
          /* Theme Color Previews */
          .theme-nature { background: linear-gradient(135deg, #a8e6cf, #dcedc1); }
          .theme-ocean { background: linear-gradient(135deg, #a8d8ea, #aa96da); }
          .theme-candy { background: linear-gradient(135deg, #ffd3b6, #ffaaa5); }
          .theme-tech { background: linear-gradient(135deg, #d4e6f1, #a9cce3); }
          .theme-rainbow { background: linear-gradient(135deg, #ff9a9e, #fad0c4, #a1c4fd, #c2e9fb); }
          .theme-classic { background: linear-gradient(135deg, #0f172a, #1e293b); }
  
          /* Input Mode Switch Styles */
          .input-mode-switch {
            display: flex;
            justify-content: center;
            margin-bottom: var(--spacing-xl);
            gap: var(--spacing-md);
          }
  
          .mode-btn {
            padding: var(--spacing-sm) var(--spacing-lg); /* Adjusted padding */
            border: 1px solid var(--primary-color);
            border-radius: var(--border-radius-full); /* Pill shape */
            background: var(--bg-card);
            color: var(--primary-color);
            font-size: var(--font-size-sm); /* Smaller font */
            cursor: pointer;
            transition: var(--transition-fast);
            font-weight: 500;
          }
  
          .mode-btn.active {
            background: var(--primary-color);
            color: var(--text-light);
            box-shadow: var(--shadow-sm);
          }
  
          .mode-btn:hover:not(.active) {
            background: rgba(99, 102, 241, 0.08);
            border-color: var(--primary-dark);
          }
  
          /* Manual Input Section */
          .manual-input-container {
            display: none; /* Handled by JS */
            margin-bottom: var(--spacing-xl);
            animation: fadeIn 0.5s ease forwards;
          }
  
          .manual-input-container.active {
            display: block;
          }
  
          .bulk-input-container {
            display: flex;
            gap: var(--spacing-xl); /* Increased gap */
            margin-bottom: var(--spacing-lg); /* Reduced bottom margin */
          }
  
          .bulk-input-column {
            flex: 1;
          }
  
          .bulk-input-label {
            display: block;
            margin-bottom: var(--spacing-sm);
            color: var(--primary-dark); /* Darker label */
            font-weight: 500;
            font-size: var(--font-size-sm);
          }
  
          .bulk-input {
            height: 180px; /* Slightly smaller */
            line-height: 1.5;
            resize: vertical;
            border-color: var(--border-color); /* Use standard border color */
          }
  
          .input-hint {
            margin-top: var(--spacing-sm);
            font-size: var(--font-size-xs); /* Smaller hint */
            color: var(--text-secondary);
          }
  
          /* Vocabulary Card Section Styles */
          .vocabulary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--spacing-xl); /* Increased gap */
          }
  
          .vocabulary-card {
            /* Inherits .card styles, add specifics */
            padding: var(--spacing-lg);
            break-inside: avoid; /* Better for printing/layout */
          }
  
          .vocabulary-card h3 {
            margin-top: 0;
            margin-bottom: var(--spacing-md); /* Increased spacing */
            color: var(--primary-dark);
            font-size: var(--font-size-lg);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: var(--spacing-sm);
            font-weight: 700;
          }
  
          .vocabulary-item {
            margin-bottom: var(--spacing-sm);
            font-size: var(--font-size-base);
          }
  
          .vocabulary-item strong {
            color: var(--text-secondary); /* Softer color for label */
            font-weight: 500;
            margin-right: var(--spacing-xs);
            display: inline-block; /* Allow margin */
            width: 50px; /* Align labels */
          }
  
          .example {
            font-style: normal; /* Remove italics for readability */
            margin-top: var(--spacing-md);
            padding: var(--spacing-md); /* Add padding */
            padding-left: var(--spacing-lg);
            border-left: 3px solid var(--primary-light); /* Thicker border */
            background-color: var(--bg-primary); /* Subtle background */
            border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
            font-size: var(--font-size-sm);
          }
  
          .example div:first-child {
              margin-bottom: var(--spacing-xs);
              color: var(--text-primary);
          }
          .example div:last-child {
              color: var(--text-secondary);
          }
  
          .highlight {
            position: relative;
            display: inline-block;
            text-decoration: none;
            background-color: rgba(14, 165, 233, 0.2);
            color: #38bdf8;
            padding: 0 8px;
            border-radius: 6px;
            font-weight: bold;
            text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
            box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
            transition: all 0.3s ease;
          }
  
          .highlight:hover {
            background-color: rgba(14, 165, 233, 0.3);
            box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
          }
  
          /* Preview Layer Styles (for Card Download) */
          /* Needs to be appended to document.body */
          .preview-layer {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.85); /* Darker overlay */
            z-index: 9999; /* Very high z-index */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start; /* Align to top */
            padding: var(--spacing-lg);
            overflow: auto;
            animation: fadeIn 0.3s ease forwards;
          }
  
          .preview-controls {
            position: sticky;
            top: 0;
            width: 100%;
            max-width: 1400px; /* Limit width */
            background-color: rgba(30, 41, 59, 0.8); /* Dark controls background */
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--border-radius-md);
            margin-bottom: var(--spacing-xl);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1; /* Above preview cards */
            backdrop-filter: blur(5px);
            box-shadow: var(--shadow-md);
            border: 1px solid rgba(255,255,255,0.1); /* Subtle border */
            color: var(--text-light); /* Light text for controls */
          }
  
          .preview-controls .status-text {
              flex-grow: 1;
              margin: 0 var(--spacing-lg);
              font-size: var(--font-size-sm);
              text-align: left;
          }
  
          .preview-controls .btn-group {
              display: flex;
              gap: var(--spacing-md);
          }
  
          .preview-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Smaller minmax */
            gap: var(--spacing-lg); /* Consistent gap */
            width: 100%;
            max-width: 1400px; /* Limit width */
            padding: 0; /* Remove extra padding */
          }
  
          .preview-card {
            position: relative;
            background: var(--bg-card);
            border-radius: var(--border-radius-md); /* Consistent radius */
            box-shadow: var(--shadow-md);
            overflow: hidden;
            transition: var(--transition-fast);
            border: 1px solid var(--border-color);
          }
  
          .preview-card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-3px); /* Slightly more lift */
          }
  
          .preview-card img { /* Style the image within */
              display: block;
              width: 100%;
              height: auto;
          }
  
          .preview-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); /* Gradient overlay */
            color: var(--text-light);
            padding: var(--spacing-lg) var(--spacing-md); /* Adjust padding */
            padding-top: var(--spacing-2xl); /* More padding top for gradient */
            display: flex;
            justify-content: space-between;
            align-items: flex-end; /* Align items to bottom */
            opacity: 0; /* Hide by default */
            transition: opacity var(--transition-fast);
            font-size: var(--font-size-sm);
            font-weight: 500;
          }
  
          .preview-card:hover .preview-overlay {
             opacity: 1; /* Show on hover */
          }
  
          .preview-download {
            color: var(--text-light);
            background: rgba(255, 255, 255, 0.2);
            border-radius: var(--border-radius-full);
            width: 32px; /* Larger button */
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition-fast);
            text-decoration: none;
            flex-shrink: 0; /* Prevent shrinking */
          }
  
          .preview-download:hover {
            background: rgba(255, 255, 255, 0.4);
            transform: scale(1.1);
          }
  
          .preview-download i {
              font-size: var(--font-size-base);
          }
  
          /* Small Button Variant */
          .btn-sm {
            padding: var(--spacing-xs) var(--spacing-md);
            font-size: var(--font-size-sm);
            border-radius: var(--border-radius-sm);
          }
  
          /* Danger Button Variant */
          .btn-danger {
            background: var(--danger-color);
            border-color: var(--danger-color);
            color: var(--text-light);
          }
  
          .btn-danger:hover {
            background: var(--danger-dark);
            border-color: var(--danger-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }
  
          /* Helper class for screen readers */
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          }
  
          /* Notification/Alert Area (for JS) */
          /* Needs to be appended to document.body */
          .notification-area {
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 10000;
              display: flex;
              flex-direction: column;
              gap: var(--spacing-md);
          }
  
          .notification {
              background-color: var(--text-dark);
              color: var(--text-light);
              padding: var(--spacing-md) var(--spacing-lg);
              border-radius: var(--border-radius-md);
              box-shadow: var(--shadow-lg);
              font-size: var(--font-size-sm);
              opacity: 0;
              transform: translateX(100%);
              transition: all 0.5s ease;
              display: flex;
              align-items: center;
              gap: var(--spacing-sm);
          }
  
          .notification.show {
              opacity: 1;
              transform: translateX(0);
          }
  
           .notification.error {
              background-color: var(--danger-dark);
           }
           .notification.success {
               background-color: #10b981; /* Green for success */
           }
           .notification i {
              font-size: 1.2em;
           }
  
           /* Error message styling */
           .error-message {
             color: var(--danger-dark);
             font-size: var(--font-size-sm);
             margin-top: var(--spacing-sm);
             display: none; /* Hidden by default */
           }
  
          /* Sticky Controls for Cards section */
          .sticky-controls {
            position: sticky;
            top: 20px; /* Adjust based on potential WP admin bar */
            z-index: 10;
            padding: 15px;
            margin-bottom: var(--spacing-xl);
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(5px);
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-md);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          }
  
          .sticky-controls .label-input-container {
            margin-bottom: 0;
            width: 100%;
          }
  
          .sticky-controls .controls-buttons {
            display: flex;
            justify-content: center;
            gap: var(--spacing-md);
          }
  
          /* Responsive Adjustments */
          @media (max-width: 1024px) {
            .bulk-input-container {
              flex-direction: column;
              gap: var(--spacing-lg);
            }
            .preview-container {
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
          }
  
          @media (max-width: 768px) {
            /* Adjust layout for mobile within shadow DOM */
            .vocab-export-wrapper { /* Target the main wrapper */
              flex-direction: column;
            }
            .sidebar {
              position: static; /* Change sidebar position */
              width: 100%;
              height: auto;
              box-shadow: var(--shadow-sm);
              border-right: none;
              border-bottom: 1px solid var(--border-color);
              /* Remove fixed height if static */
              /* height: auto; */
              overflow-y: visible; /* Or clip */
            }
            .main-content {
              margin-left: 0;
              padding: var(--spacing-xl); /* Adjust padding for mobile */
            }
            .nav-menu {
              display: flex; /* Horizontal nav on mobile */
              overflow-x: auto; /* Allow scrolling */
              padding-bottom: var(--spacing-sm); /* Add padding for scrollbar */
            }
            .nav-item {
                margin-bottom: 0;
                flex-shrink: 0; /* Prevent items from shrinking */
            }
             .nav-link {
                padding: var(--spacing-md);
                white-space: nowrap;
             }
            .themes {
              grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); /* Smaller themes on mobile */
              gap: var(--spacing-md);
            }
            .theme-preview {
              height: 50px;
            }
            .label-input-container {
                flex-direction: column;
                align-items: stretch; /* Stretch items */
            }
             .container {
                padding: 0 var(--spacing-md); /* Add horizontal padding on mobile */
             }
              .usage-steps {
                  padding: var(--spacing-lg);
              }
              .vocabulary-grid {
                   grid-template-columns: 1fr; /* Single column on small screens */
                   gap: var(--spacing-lg);
              }
               .preview-container {
                   grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
               }
                .preview-controls {
                    flex-direction: column;
                    gap: var(--spacing-md);
                    align-items: stretch;
                }
                .preview-controls .btn-group {
                    justify-content: center;
                }
                 .preview-controls .status-text {
                     text-align: center;
                     margin-bottom: var(--spacing-sm);
                 }
                 .sticky-controls {
                    padding: 10px;
                    top: 10px; /* Adjust sticky position for mobile */
                 }
                 .sticky-controls .controls-buttons {
                    flex-direction: column;
                    width: 100%;
                 }
          }
  
        </style>
  
        <div class="vocab-export-wrapper">
          <!-- Left Sidebar -->
          <aside class="sidebar" aria-label="主導覽列">
            <div class="sidebar-header">
              <h1><i class="fas fa-book-open" aria-hidden="true"></i> VocabExport</h1>
            </div>
            <nav>
              <ul class="nav-menu">
                <li class="nav-item">
                  <a href="#word-wall" class="nav-link active" data-page="word-wall">
                    <i class="fas fa-th-large" aria-hidden="true"></i>
                    <span>單字牆</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a href="#vocabulary-cards" class="nav-link" data-page="vocabulary-cards">
                    <i class="fas fa-id-card" aria-hidden="true"></i>
                    <span>單字圖片</span>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
  
          <!-- Main Content Area -->
          <main class="main-content">
            <!-- Word Wall Section -->
            <section id="word-wall" class="content-section active" data-page="word-wall" aria-labelledby="word-wall-heading">
              <div class="container">
                <header class="header">
                  <h1 id="word-wall-heading"><i class="fas fa-th-large" aria-hidden="true"></i> 單字牆</h1>
                  <p>快速生成精美的單字牆圖片，適合教學或個人複習使用。</p>
                </header>
  
                <section class="usage-steps" aria-labelledby="word-wall-usage-heading">
                  <h2 id="word-wall-usage-heading" class="usage-toggle">
                    <span>使用說明</span>
                    <i class="fas fa-chevron-down ml-2 transition-transform"></i>
                  </h2>
                  <div class="steps">
                    <div class="step">
                      <div class="step-number" aria-hidden="true">1</div>
                      <div class="step-content">選擇輸入方式：從 Google Sheet 載入或手動輸入。</div>
                    </div>
                    <div class="step">
                      <div class="step-number" aria-hidden="true">2</div>
                      <div class="step-content">輸入單元標籤或單字列表。</div>
                    </div>
                    <div class="step">
                      <div class="step-number" aria-hidden="true">3</div>
                      <div class="step-content">選擇喜歡的視覺主題。</div>
                    </div>
                    <div class="step">
                      <div class="step-number" aria-hidden="true">4</div>
                      <div class="step-content">點擊「生成單字牆」按鈕。</div>
                    </div>
                    <div class="step">
                      <div class="step-number" aria-hidden="true">5</div>
                      <div class="step-content">預覽並下載生成的圖片。</div>
                  </div>
                </div>
                </section>
  
                <div class="input-mode-switch" role="tablist" aria-label="單字輸入模式">
                  <button class="mode-btn active" data-mode="sheet" role="tab" aria-selected="true" aria-controls="sheet-input-panel">從 Google Sheet 載入</button>
                  <button class="mode-btn" data-mode="manual" role="tab" aria-selected="false" aria-controls="manual-input-panel">手動輸入</button>
                </div>
  
                <!-- Google Sheet Input -->
                <div id="sheet-input-panel" class="sheet-input-container active" role="tabpanel" aria-labelledby="sheet-mode-btn">
                  <div class="label-input-container">
                     <label for="label-input" class="sr-only">Google Sheet 單元標籤</label>
                     <input type="text" id="label-input" class="label-input" placeholder="輸入或選擇 Google Sheet 標籤" list="sheet-labels-datalist">
                    <button id="generate-btn" class="btn btn-primary">
                      <i class="fas fa-magic" aria-hidden="true"></i> 生成單字牆
                    </button>
                  </div>
                   <div id="sheet-error-message" class="error-message" aria-live="polite"></div>
                </div>
  
                <!-- Manual Input -->
                <div id="manual-input-panel" class="manual-input-container" role="tabpanel" aria-labelledby="manual-mode-btn">
                  <div class="bulk-input-container">
                    <div class="bulk-input-column">
                      <label for="english-input" class="bulk-input-label">英文單字 (English Words)</label>
                      <textarea class="bulk-input" id="english-input" placeholder="apple\nbanana\norange" aria-label="英文單字列表，每行一個"></textarea>
                      <div class="input-hint">每行輸入一個英文單字。</div>
                    </div>
                    <div class="bulk-input-column">
                      <label for="chinese-input" class="bulk-input-label">中文翻譯 (Chinese Translations)</label>
                      <textarea class="bulk-input" id="chinese-input" placeholder="蘋果\n香蕉\n橘子" aria-label="中文翻譯列表，每行一個，需與英文單字對應"></textarea>
                      <div class="input-hint">每行輸入一個中文翻譯，需與左側英文單字一一對應。</div>
                    </div>
                  </div>
                  <div class="label-input-container">
                    <label for="manual-label-input" class="sr-only">手動輸入標題</label>
                    <input type="text" id="manual-label-input" class="label-input" placeholder="請輸入單字牆標題 (選填，例如：水果單字)">
                    <button id="manual-generate-btn" class="btn btn-primary">
                      <i class="fas fa-magic" aria-hidden="true"></i> 生成單字牆
                    </button>
                  </div>
                   <div id="manual-error-message" class="error-message" aria-live="polite"></div>
                </div>
  
                <!-- Theme Selector -->
                <section class="theme-selector" aria-labelledby="theme-select-heading">
                  <div class="theme-selector-header" aria-expanded="true" aria-controls="themes-container">
                    <h2 id="theme-select-heading">
                      <i class="fas fa-palette" aria-hidden="true"></i>
                      選擇單字牆主題
                    </h2>
                    <i class="fas fa-chevron-down" aria-hidden="true"></i>
                  </div>
                  <div id="themes-container" class="themes expanded">
                    <div class="theme-option" data-theme="rainbow" role="button" tabindex="0" aria-label="選擇彩虹主題">
                      <div class="theme-preview theme-rainbow" aria-hidden="true"></div>
                      <div class="theme-name">彩虹 (預設)</div>
                    </div>
                    <div class="theme-option" data-theme="nature" role="button" tabindex="0" aria-label="選擇自然主題">
                      <div class="theme-preview theme-nature" aria-hidden="true"></div>
                      <div class="theme-name">自然</div>
                    </div>
                    <div class="theme-option" data-theme="ocean" role="button" tabindex="0" aria-label="選擇海洋主題">
                      <div class="theme-preview theme-ocean" aria-hidden="true"></div>
                      <div class="theme-name">海洋</div>
                    </div>
                    <div class="theme-option" data-theme="candy" role="button" tabindex="0" aria-label="選擇甜點主題">
                      <div class="theme-preview theme-candy" aria-hidden="true"></div>
                      <div class="theme-name">甜點</div>
                    </div>
                     <div class="theme-option" data-theme="tech" role="button" tabindex="0" aria-label="選擇科技主題">
                       <div class="theme-preview theme-tech" aria-hidden="true"></div>
                       <div class="theme-name">科技</div>
                    </div>
                    <div class="theme-option" data-theme="classic" role="button" tabindex="0" aria-label="選擇深空主題">
                      <div class="theme-preview theme-classic" aria-hidden="true"></div>
                      <div class="theme-name">深空</div>
                  </div>
                </div>
                </section>
              </div>
            </section>
  
            <!-- Vocabulary Cards Section -->
            <section id="vocabulary-cards" class="content-section" data-page="vocabulary-cards" aria-labelledby="vocab-cards-heading">
              <div class="container">
                <header class="header">
                  <h1 id="vocab-cards-heading"><i class="fas fa-id-card" aria-hidden="true"></i> 單字圖片</h1>
                  <p>將 Google Sheet 中的單字卡資料轉換為方便分享或列印的圖片。</p>
                </header>
  
                <section class="usage-steps" aria-labelledby="vocab-cards-usage-heading">
                  <h2 id="vocab-cards-usage-heading" class="usage-toggle">
                    <span>使用說明</span>
                    <i class="fas fa-chevron-down ml-2 transition-transform"></i>
                  </h2>
                  <div class="steps">
                    <div class="step">
                      <div class="step-number" aria-hidden="true">1</div>
                      <div class="step-content">在下方輸入框中，輸入 Google Sheet 對應的單元標籤。</div>
                    </div>
                    <div class="step">
                      <div class="step-number" aria-hidden="true">2</div>
                      <div class="step-content">點擊「生成單字卡片」按鈕載入資料。</div>
                    </div>
                    <div class="step">
                      <div class="step-number" aria-hidden="true">3</div>
                      <div class="step-content">載入成功後，點擊「下載所有卡片」按鈕。</div>
                    </div>
                    <div class="step">
                      <div class="step-number" aria-hidden="true">4</div>
                      <div class="step-content">在預覽彈窗中，可單獨下載或批次下載所有圖片 (ZIP)。</div>
                  </div>
                </div>
                </section>
  
                <div class="sticky-controls">
                  <div class="label-input-container">
                     <label for="card-label-input" class="sr-only">Google Sheet 單元標籤</label>
                    <input type="text" id="card-label-input" class="label-input" placeholder="輸入或選擇 Google Sheet 標籤" list="sheet-labels-datalist">
                    <button id="generate-cards-btn" class="btn btn-primary">
                      <i class="fas fa-cog" aria-hidden="true"></i> 生成單字卡片
                    </button>
                  </div>
                  <div id="cards-download-container" class="controls-buttons" style="display: none;">
                    <button id="download-cards-btn" class="btn btn-primary">
                      <i class="fas fa-download" aria-hidden="true"></i> 下載所有卡片圖片
                    </button>
                  </div>
                </div>
                 <div id="cards-error-message" class="error-message" aria-live="polite"></div>
  
                <div id="cards-content-area">
                   <p class="placeholder-text" style="text-align: center; color: var(--text-secondary); margin-top: var(--spacing-xl);">請輸入單元標籤並點擊生成按鈕以載入卡片。</p>
                </div>
              </div>
            </section>
          </main> <!-- End of main content -->
        </div> <!-- End of vocab-export-wrapper -->
  
        <!-- Datalist for sheet labels -->
        <datalist id="sheet-labels-datalist">
          <!-- Options will be populated by JavaScript -->
        </datalist>
  
        <!-- Elements below need careful handling - modals, loading, notifications -->
        <!-- These will be appended to document.body by the JS logic -->
        <!--
        <div id="loading" ... ></div>
        <div id="notification-area" ... ></div>
        <div class="word-wall-modal" ... ></div>
        <div class="preview-layer" ... ></div>
        -->
      `;
    }
  
    initializeAppLogic() {
      const shadow = this.shadowRoot;
      const componentRoot = this; // Reference to the Web Component instance
  
      // --- Start of original script content, adapted for Shadow DOM ---
  
      // Constants (scoped within the component)
      const CONSTANTS = {
        SPREADSHEET_ID: "1wSHAL3piJGEJ8EnoyK_W9kkvL42GQYId35UEhMzHTZY",
        GID: "0",
        DEFAULT_LABEL: "自定義單字",
        NOTIFICATION_TIMEOUT: 4000, // 4 seconds
      };
  
      // Utility Functions (scoped or attached to the component)
      const Utils = {
        // --- IMPORTANT ---
        // Modals, Loading indicators, Notifications need to be appended to document.body
        // because they use `position: fixed` and need to overlay the entire page,
        // not just the component.
  
        _getOrCreateContainer: (id, className, parent = document.body) => {
            let container = document.getElementById(id);
            if (!container) {
                container = document.createElement('div');
                container.id = id;
                container.className = className;
                // Style needs to be applied directly or via global CSS if needed outside shadow DOM
                Object.assign(container.style, {
                    position: 'fixed', // Example style
                    zIndex: '10000',
                    // Add other necessary base styles
                });
                parent.appendChild(container);
            }
            return container;
        },
  
        showLoading: (isLoading, message = '載入中...') => {
          const loadingElement = Utils._getOrCreateContainer('vocab-export-loading', 'loading-overlay'); // Use unique ID
          const loadingContentClass = 'loading-content'; // Class from original CSS
          const iconClass = 'fas fa-spinner fa-spin fa-2x';
  
          if (isLoading) {
              loadingElement.innerHTML = `
                <div class="${loadingContentClass}" style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-lg); color: var(--text-dark); font-size: var(--font-size-lg); font-weight: 500; background-color: var(--bg-card); padding: var(--spacing-xl) var(--spacing-2xl); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg);">
                  <i class="${iconClass}" aria-hidden="true" style="color: var(--primary-color); font-size: 2rem;"></i>
                  <span id="loading-message">${message}</span>
                </div>`;
              // Apply necessary styles directly or ensure global styles exist
              Object.assign(loadingElement.style, {
                  top: '0', left: '0', width: '100%', height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)', display: 'flex',
                  justifyContent: 'center', alignItems: 'center', zIndex: '1999'
              });
              loadingElement.style.display = 'flex';
          } else {
               if (loadingElement && loadingElement.parentNode) {
                  loadingElement.style.display = 'none'; // Hide instead of removing immediately
                  // Optional: remove after a delay or transition
                  // setTimeout(() => loadingElement.remove(), 500);
               }
          }
        },
  
        calculateGrid: (itemCount) => {
          if (itemCount <= 0) return { cols: 1, rows: 1 };
          const targetAspectRatio = 16 / 9;
          let bestCols = 1;
          let bestRows = itemCount;
  
          for (let cols = 1; cols <= Math.ceil(Math.sqrt(itemCount * targetAspectRatio)); cols++) {
            const rows = Math.ceil(itemCount / cols);
            if (cols * rows >= itemCount) {
              if (Math.abs(cols / rows - targetAspectRatio) < Math.abs(bestCols / bestRows - targetAspectRatio)) {
                bestCols = cols;
                bestRows = rows;
              } else if (cols * rows < bestCols * bestRows) {
                bestCols = cols;
                bestRows = rows;
              }
            }
          }
          return { cols: bestCols, rows: bestRows };
        },
  
        calculateFontSize: (wordLength, baseSize, minSizeFactor = 0.6) => {
          const minSize = baseSize * minSizeFactor;
          if (wordLength <= 5) return baseSize;
          if (wordLength <= 8) return baseSize * 0.9;
          if (wordLength <= 12) return baseSize * 0.8;
          if (wordLength <= 16) return baseSize * 0.7;
          return Math.max(minSize, baseSize * 0.6);
        },
  
        debounce: (func, wait) => {
          let timeout;
          return function executedFunction(...args) {
            const later = () => {
              clearTimeout(timeout);
              func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
        },
  
        showNotification: (message, type = 'info') => {
          const notificationArea = Utils._getOrCreateContainer('vocab-export-notification-area', 'notification-area');
          // Apply necessary styles for notification-area directly
           Object.assign(notificationArea.style, {
               position: 'fixed', bottom: '20px', right: '20px', zIndex: '10000',
               display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'
           });
  
          const notification = document.createElement('div');
          notification.className = `notification ${type}`; // Use classes defined in shadow DOM (or global)
  
          let iconClass = 'fas fa-info-circle';
          if (type === 'success') iconClass = 'fas fa-check-circle';
          if (type === 'error') iconClass = 'fas fa-exclamation-triangle';
  
          notification.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i> ${message}`;
          // Apply base notification styles directly or ensure global styles exist
           Object.assign(notification.style, {
               backgroundColor: 'var(--text-dark)', color: 'var(--text-light)',
               padding: 'var(--spacing-md) var(--spacing-lg)', borderRadius: 'var(--border-radius-md)',
               boxShadow: 'var(--shadow-lg)', fontSize: 'var(--font-size-sm)',
               opacity: '0', transform: 'translateX(100%)', transition: 'all 0.5s ease',
               display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)'
           });
           // Apply type-specific background colors
           if (type === 'error') notification.style.backgroundColor = 'var(--danger-dark)';
           if (type === 'success') notification.style.backgroundColor = '#10b981'; // Green for success
  
          notificationArea.appendChild(notification);
  
          requestAnimationFrame(() => {
              notification.style.opacity = '1';
              notification.style.transform = 'translateX(0)';
          });
  
          setTimeout(() => {
              notification.style.opacity = '0';
              notification.style.transform = 'translateX(100%)';
              notification.addEventListener('transitionend', () => {
                  if (notification.parentNode === notificationArea) {
                       notificationArea.removeChild(notification);
                  }
              }, { once: true });
          }, CONSTANTS.NOTIFICATION_TIMEOUT);
        },
  
        clearErrorMessage: (elementId) => {
          const errorElement = shadow.getElementById(elementId); // Use shadow.getElementById
          if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
          }
        },
  
        displayErrorMessage: (elementId, message) => {
          const errorElement = shadow.getElementById(elementId); // Use shadow.getElementById
          if (errorElement) {
            errorElement.textContent = message;
            // Styles are applied via the .error-message class in shadow DOM CSS
            errorElement.style.display = 'block';
          } else {
            Utils.showNotification(message, 'error'); // Fallback
          }
        }
      };
  
      // Main Application Class (defined within the component's scope)
      class VocabAppLogic {
        constructor(rootElement) {
          this.root = rootElement; // The shadow root
          this.vocabularyData = [];
          this.selectedTheme = 'rainbow';
          this.cachedWallImages = {};
          this.currentLabel = '';
          this.lastUsedLabel = '';
          this.inputMode = 'sheet';
          this.manualWords = [];
          this.availableSheetLabels = [];
  
          // Bind methods
          this.handleGenerate = this.handleGenerate.bind(this);
          this.handleThemeSelection = this.handleThemeSelection.bind(this);
          this.handleModeSwitch = this.handleModeSwitch.bind(this);
          this.handleNavigation = this.handleNavigation.bind(this);
          this.handleCardGeneration = this.handleCardGeneration.bind(this);
          this.downloadAllCards = this.downloadAllCards.bind(this);
          this.fetchAllSheetLabels = this.fetchAllSheetLabels.bind(this);
          this.populateLabelDatalist = this.populateLabelDatalist.bind(this);
          this.setupUsageToggles = this.setupUsageToggles.bind(this); // Add usage toggle setup
  
          this.setupEventListeners();
          this.setupThemeSelector();
          this.setupModeSwitch();
          this.setupNavigation();
          this.setupCardGeneration();
          this.setupUsageToggles(); // Call the setup
  
          this.showInitialSection();
          this.initializeAppTheme();
  
          this.fetchAllSheetLabels();
        }
  
        // --- Copy ALL methods from the original VocabExportApp class here ---
        // --- Make sure to replace document.getElementById/querySelector ---
        // --- with this.root.getElementById/querySelector ---
        // --- And handle elements appended to document.body carefully ---
  
        initializeAppTheme() {
            const initialThemeOption = this.root.querySelector(`.theme-option[data-theme="${this.selectedTheme}"]`);
            if (initialThemeOption) {
                initialThemeOption.classList.add('selected');
            }
            const themeHeader = this.root.querySelector('.theme-selector-header');
            const themesContainer = this.root.querySelector('.themes');
            if (themeHeader && themesContainer) {
                themeHeader.classList.remove('collapsed');
                themesContainer.classList.add('expanded');
                themeHeader.setAttribute('aria-expanded', 'true');
            }
        }
  
        showInitialSection() {
            this.root.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            const defaultSection = this.root.querySelector('.content-section[data-page="word-wall"]');
            if (defaultSection) {
                defaultSection.classList.add('active');
            }
        }
  
        handleNavigation(event) {
            event.preventDefault();
            const link = event.currentTarget;
            const targetPage = link.dataset.page;
  
            this.root.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
  
            this.root.querySelectorAll('.content-section').forEach(section => {
                section.classList.toggle('active', section.dataset.page === targetPage);
            });
  
            if (this.lastUsedLabel) {
                let targetInputId;
                if (targetPage === 'word-wall') {
                    targetInputId = 'label-input';
                } else if (targetPage === 'vocabulary-cards') {
                    targetInputId = 'card-label-input';
                }
  
                if (targetInputId) {
                    const targetInput = this.root.getElementById(targetInputId);
                    if (targetInput) {
                        targetInput.value = this.lastUsedLabel;
                    }
                }
            }
        }
  
        setupNavigation() {
            this.root.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', this.handleNavigation);
            });
        }
  
        handleThemeSelection(event) {
            const target = event.target;
            const themeHeader = target.closest('.theme-selector-header');
            const themeOption = target.closest('.theme-option');
            const themesContainer = this.root.querySelector('.themes');
            const headerElement = this.root.querySelector('.theme-selector-header');
  
            if (themeHeader && headerElement && themesContainer) { // Ensure elements exist
                const isCollapsed = headerElement.classList.toggle('collapsed');
                themesContainer.classList.toggle('expanded', !isCollapsed);
                headerElement.setAttribute('aria-expanded', String(!isCollapsed));
                return;
            }
  
            if (themeOption) {
                this.root.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                themeOption.classList.add('selected');
                this.selectedTheme = themeOption.dataset.theme;
                // Optionally trigger preview update if image already generated
                // this.updatePreviewForSelectedTheme();
            }
        }
  
  
        setupThemeSelector() {
            const themeSelector = this.root.querySelector('.theme-selector');
            if (themeSelector) {
                themeSelector.addEventListener('click', Utils.debounce(this.handleThemeSelection, 50));
                themeSelector.addEventListener('keydown', (event) => {
                    const themeOption = event.target.closest('.theme-option');
                    if (themeOption && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        this.handleThemeSelection({ target: themeOption });
                    }
                    const themeHeader = event.target.closest('.theme-selector-header');
                     if (themeHeader && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          this.handleThemeSelection({ target: themeHeader });
                     }
                });
            }
        }
  
        handleModeSwitch(event) {
            const btn = event.currentTarget;
            const targetMode = btn.dataset.mode;
            if (targetMode === this.inputMode) return;
  
            this.inputMode = targetMode;
  
            this.root.querySelectorAll('.mode-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.mode === this.inputMode);
                b.setAttribute('aria-selected', String(b.dataset.mode === this.inputMode));
            });
  
            this.root.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                const isActive = panel.id.startsWith(this.inputMode);
                panel.classList.toggle('active', isActive);
                panel.style.display = isActive ? 'block' : 'none';
            });
  
            this.cleanupCachedImages();
            Utils.clearErrorMessage('sheet-error-message');
            Utils.clearErrorMessage('manual-error-message');
        }
  
        setupModeSwitch() {
            this.root.querySelectorAll('.mode-btn').forEach(btn => {
                btn.addEventListener('click', this.handleModeSwitch);
            });
        }
  
        async handleGenerate(isManual) {
            const generateButton = this.root.getElementById(isManual ? 'manual-generate-btn' : 'generate-btn');
            const labelInput = this.root.getElementById(isManual ? 'manual-label-input' : 'label-input');
            const errorElementId = isManual ? 'manual-error-message' : 'sheet-error-message';
            Utils.clearErrorMessage(errorElementId);
            generateButton.disabled = true;
  
            const label = isManual
                ? labelInput.value.trim() || CONSTANTS.DEFAULT_LABEL
                : labelInput.value.trim();
  
            if (!isManual && !label) {
                Utils.displayErrorMessage(errorElementId, '請輸入 Google Sheet 中的單元標籤 (例如：unit1)。');
                generateButton.disabled = false;
                return;
            }
  
            if (label) {
                this.lastUsedLabel = label;
            }
  
            try {
                if (isManual) {
                    const englishInput = this.root.getElementById('english-input');
                    const chineseInput = this.root.getElementById('chinese-input');
                    const englishWords = englishInput.value.trim().split('\n').map(w => w.trim()).filter(Boolean);
                    const chineseTranslations = chineseInput.value.trim().split('\n').map(w => w.trim()).filter(Boolean);
  
                    if (englishWords.length === 0) {
                        Utils.displayErrorMessage(errorElementId, '請至少輸入一個有效的英文單字。');
                        generateButton.disabled = false;
                        return;
                    }
  
                    if (chineseTranslations.length > 0 && chineseTranslations.length !== englishWords.length) {
                        Utils.displayErrorMessage(errorElementId, '英文單字和中文翻譯的數量必須相同，或只提供英文單字。');
                        generateButton.disabled = false;
                        return;
                    }
  
                    this.manualWords = englishWords.map((en, index) => ({
                        en: en,
                        cn: chineseTranslations[index] || ''
                    }));
  
                    this.vocabularyData = this.manualWords.map(word => [word.en, '', word.cn, '', '', '', '', '']);
                    this.currentLabel = label;
                    await this.preloadWallImages(this.manualWords, this.currentLabel);
  
                } else { // Google Sheet Mode
                    if (label !== this.currentLabel || !this.cachedWallImages[this.selectedTheme]) {
                        this.currentLabel = label;
                        this.cleanupCachedImages();
                        await this.loadVocabularyData(label);
                    } else {
                        this.updatePreviewForSelectedTheme();
                    }
                }
            } catch (error) {
                console.error('生成單字牆時發生錯誤:', error);
                Utils.displayErrorMessage(errorElementId, `處理失敗：${error.message}`);
                Utils.showNotification(`生成單字牆失敗: ${error.message}`, 'error');
            } finally {
                generateButton.disabled = false;
            }
        }
  
        setupEventListeners() {
            const generateBtn = this.root.getElementById('generate-btn');
            const manualGenerateBtn = this.root.getElementById('manual-generate-btn');
            const labelInput = this.root.getElementById('label-input');
            const manualLabelInput = this.root.getElementById('manual-label-input');
            const englishInput = this.root.getElementById('english-input');
            const chineseInput = this.root.getElementById('chinese-input');
  
            if (generateBtn) {
                generateBtn.addEventListener('click', Utils.debounce(() => this.handleGenerate(false), 300));
            }
            if (manualGenerateBtn) {
                manualGenerateBtn.addEventListener('click', Utils.debounce(() => this.handleGenerate(true), 300));
            }
  
            const handleEnter = (e, isManual) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleGenerate(isManual);
                }
            };
  
            if (labelInput) {
                labelInput.addEventListener('keypress', (e) => handleEnter(e, false));
                labelInput.addEventListener('input', () => Utils.clearErrorMessage('sheet-error-message'));
            }
            if (manualLabelInput) {
                manualLabelInput.addEventListener('keypress', (e) => handleEnter(e, true));
                manualLabelInput.addEventListener('input', () => Utils.clearErrorMessage('manual-error-message'));
            }
             if (englishInput) {
                 englishInput.addEventListener('input', () => Utils.clearErrorMessage('manual-error-message'));
             }
             if (chineseInput) {
                 chineseInput.addEventListener('input', () => Utils.clearErrorMessage('manual-error-message'));
             }
        }
  
         updatePreviewForSelectedTheme() {
             console.log(`[updatePreviewForSelectedTheme] Called. Selected theme: ${this.selectedTheme}`);
             if (this.cachedWallImages && this.cachedWallImages[this.selectedTheme]) {
                 console.log(`[updatePreviewForSelectedTheme] Found cached image for ${this.selectedTheme}. Calling showWordWallPreview.`);
                 this.showWordWallPreview(this.cachedWallImages[this.selectedTheme]);
             } else {
                 console.warn(`[updatePreviewForSelectedTheme] Image for theme ${this.selectedTheme} is not ready or cached.`);
                 // Utils.showNotification(`主題 ${this.selectedTheme} 的圖片正在生成中...`, 'info');
             }
         }
  
  
        showWordWallPreview(imageUrl) {
             console.log(`[showWordWallPreview] Called with imageUrl (length: ${imageUrl?.length || 0})`);
             const existingModal = document.querySelector('.word-wall-modal'); // Query global document
             if (existingModal) {
                 existingModal.remove();
             }
  
             // Create modal elements dynamically and append to document.body
             const modal = document.createElement('div');
             modal.className = 'word-wall-modal'; // Use class defined globally or apply styles directly
             modal.setAttribute('role', 'dialog');
             modal.setAttribute('aria-modal', 'true');
             modal.setAttribute('aria-labelledby', 'word-wall-preview-title');
             // Apply fixed positioning styles directly
              Object.assign(modal.style, {
                  position: 'fixed', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  zIndex: '2000', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: 'var(--spacing-lg)', overflow: 'auto'
                  // animation: 'fadeIn 0.3s ease forwards' // Consider adding animation via JS if needed
              });
  
  
             const modalContent = document.createElement('div');
             modalContent.className = 'word-wall-modal-content'; // Use class defined globally or style directly
              Object.assign(modalContent.style, {
                  maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                  gap: 'var(--spacing-lg)', backgroundColor: 'var(--bg-card)', padding: 'var(--spacing-lg)',
                  borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)'
              });
  
             const title = document.createElement('h3');
             title.id = 'word-wall-preview-title';
             title.className = 'sr-only';
             title.textContent = `單字牆預覽 - ${this.currentLabel} (${this.selectedTheme} 主題)`;
             modalContent.appendChild(title);
  
             const img = document.createElement('img');
             img.className = 'word-wall-preview'; // Use class defined globally or style directly
              Object.assign(img.style, {
                  maxWidth: '100%', maxHeight: 'calc(80vh - 100px)', objectFit: 'contain',
                  borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)'
              });
             img.src = imageUrl;
             img.alt = `單字牆預覽：${this.currentLabel} - ${this.selectedTheme} 主題`;
  
             const controls = document.createElement('div');
             controls.className = 'word-wall-modal-controls'; // Use class defined globally or style directly
              Object.assign(controls.style, {
                  display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center',
                  paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)'
              });
  
             const downloadBtn = document.createElement('a');
             downloadBtn.className = 'btn btn-primary btn-download'; // Use classes defined in shadow/global CSS
             downloadBtn.href = imageUrl;
             const safeLabel = this.currentLabel.replace(/[^a-z0-9_\-]/gi, '_').substring(0, 30);
             const safeTheme = this.selectedTheme.replace(/[^a-z0-9_\-]/gi, '_');
             downloadBtn.download = `VocabExport_${safeLabel}_${safeTheme}.png`;
             downloadBtn.innerHTML = '<i class="fas fa-download" aria-hidden="true"></i> 下載圖片';
             downloadBtn.setAttribute('role', 'button');
             // Apply base btn styles if not relying on global class
              Object.assign(downloadBtn.style, {
                  /* Add .btn styles if needed */
                  padding: 'var(--spacing-md) var(--spacing-xl)', fontSize: 'var(--font-size-base)',
                  borderRadius: 'var(--border-radius-md)', background: 'var(--primary-color)',
                  color: 'var(--text-light)', cursor: 'pointer', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)'
              });
  
             const closeBtn = document.createElement('button');
             closeBtn.className = 'btn btn-secondary btn-close'; // Use classes defined in shadow/global CSS
             closeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> 關閉';
             closeBtn.setAttribute('aria-label', '關閉預覽');
             closeBtn.onclick = () => modal.remove();
              Object.assign(closeBtn.style, {
                   /* Add .btn styles if needed */
                  padding: 'var(--spacing-md) var(--spacing-lg)', fontSize: 'var(--font-size-base)',
                  borderRadius: 'var(--border-radius-md)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)'
              });
  
  
             controls.appendChild(downloadBtn);
             controls.appendChild(closeBtn);
             modalContent.appendChild(img);
             modalContent.appendChild(controls);
             modal.appendChild(modalContent);
  
             document.body.appendChild(modal); // Append to light DOM
             closeBtn.focus();
        }
  
         async loadVocabularyData(label) {
             Utils.showLoading(true, `正在從 Google Sheet 載入標籤 \"${label}\" 的資料...`);
             const errorElementId = 'sheet-error-message';
             Utils.clearErrorMessage(errorElementId);
  
             try {
                 const url = `https://docs.google.com/spreadsheets/d/${CONSTANTS.SPREADSHEET_ID}/export?format=csv&gid=${CONSTANTS.GID}`;
                 const response = await fetch(url);
                 if (!response.ok) {
                     throw new Error(`無法載入試算表資料 (HTTP ${response.status})。請檢查網路連線或試算表權限。`);
                 }
  
                 const csvText = await response.text();
                 if (!csvText || !csvText.trim()) {
                     throw new Error('從 Google Sheet 獲取的資料為空。請檢查試算表內容。');
                 }
  
                 // Use PapaParse loaded globally or ensure it's available
                 const { data, errors } = Papa.parse(csvText, { header: false });
  
                 if (errors.length > 0) {
                     console.warn("CSV 解析時發生錯誤:", errors);
                 }
  
                 if (!data || data.length < 1) {
                     throw new Error('解析後的資料為空或格式不符。');
                 }
  
                 // --- Logic as per original ---
                  const allRows = data;
                  const headerRowForDisplay = allRows[0]; // Keep potential header
  
                  // Filter based on the first column (index 0) matching the label
                  const filteredData = allRows.filter((row, index) => {
                      // Optionally skip the first row if it's always a header:
                      // if (index === 0 && headerRowForDisplay[0]?.trim().toLowerCase() === 'label') return false;
                      return row[0]?.trim().toLowerCase() === label.toLowerCase();
                   });
  
                  if (filteredData.length === 0) {
                      // Try fetching labels again in case the list was outdated
                      await this.fetchAllSheetLabels();
                      if(this.availableSheetLabels.includes(label)){
                           throw new Error(`在 Google Sheet 中找到標籤 \"${label}\" 但無對應資料列。請檢查試算表內容。`);
                      } else {
                           throw new Error(`在 Google Sheet 中找不到標籤 (Label) 為 \"${label}\" 的資料。請檢查標籤名稱是否正確 (第一欄)，或從建議列表中選擇。`);
                      }
                  }
  
                  // Slice off the first column (Label) for vocabularyData
                  const slicedHeader = headerRowForDisplay?.slice(1) || [];
                  this.vocabularyData = [slicedHeader, ...filteredData.map(row => row.slice(1))];
  
                  // Extract word pairs from the *sliced* data
                  // Index 0 = English (original col 1), Index 2 = Chinese (original col 3)
                  const wordPairs = this.vocabularyData.slice(1).map(row => ({
                      en: row[0]?.trim() || '', // English is now at index 0 of the sliced row
                      cn: row[2]?.trim() || ''  // Chinese is now at index 2 of the sliced row
                  })).filter(pair => pair.en); // Filter out rows without English word
  
                  if (wordPairs.length === 0) {
                       throw new Error(`標籤 \"${label}\" 下沒有找到有效的英文單字 (第二欄)。`);
                  }
  
                 await this.preloadWallImages(wordPairs, label);
  
             } catch (error) {
                 console.error('載入 Google Sheet 資料失敗 (Word Wall):', error);
                 Utils.displayErrorMessage(errorElementId, `載入資料失敗：${error.message}`);
                 throw error; // Re-throw for handleGenerate
             } finally {
                 Utils.showLoading(false);
             }
         }
  
         async preloadWallImages(wordPairs, label) {
              Utils.showLoading(true, `正在生成 "${label}" 的單字牆預覽圖...`);
              this.cleanupCachedImages();
  
              const themes = ['rainbow', 'nature', 'ocean', 'candy', 'tech', 'classic'];
              const imagePromises = themes.map(theme => {
                // Pass the shadow root's context if needed, or call directly
                return this.generateWallImageForTheme(theme, wordPairs, label)
                  .then(imageUrl => ({ theme, imageUrl }))
                  .catch(error => {
                    console.error(`預載主題 \"${theme}\" 失敗:`, error);
                    return { theme, imageUrl: null };
                  })
              });
  
              try {
                const results = await Promise.all(imagePromises);
                results.forEach(({ theme, imageUrl }) => {
                  if (imageUrl) {
                    this.cachedWallImages[theme] = imageUrl;
                  }
                });
  
                this.updatePreviewForSelectedTheme(); // Show preview for initially selected theme
                Utils.showNotification(`"${label}" 的單字牆主題已準備好。`, 'success');
  
              } catch (error) {
                console.error("預載單字牆圖片時發生未預期的錯誤:", error);
                Utils.showNotification("生成部分單字牆主題時發生錯誤。", 'error');
              } finally {
                Utils.showLoading(false);
              }
          }
  
          // --- IMPORTANT: html2canvas issues with Shadow DOM ---
          // html2canvas generally cannot directly render Shadow DOM content easily.
          // The standard workaround is to:
          // 1. Clone the relevant nodes from the Shadow DOM.
          // 2. Create a temporary container OUTSIDE the Shadow DOM (in the light DOM).
          // 3. Append the cloned nodes and necessary styles to this temporary container.
          // 4. Run html2canvas on the temporary container.
          // 5. Remove the temporary container.
          async generateWallImageForTheme(theme, wordPairs, label) {
              const tempContainerId = `temp-word-wall-container-${theme}-${Date.now()}`;
              const tempContainer = document.createElement('div');
              tempContainer.id = tempContainerId;
              tempContainer.className = 'word-wall-container'; // Use original class for styling base
  
              // --- Apply necessary styles for the container ---
              const themeColors = this.getThemeColorsByName(theme);
              const grid = Utils.calculateGrid(wordPairs.length);
              Object.assign(tempContainer.style, {
                  position: 'fixed', // Position off-screen
                  left: '-9999px',
                  top: '-9999px', // Ensure it's truly off-screen
                  width: '1920px',
                  height: '1080px',
                  display: 'grid',
                  padding: '40px',
                  boxSizing: 'border-box',
                  placeItems: 'center',
                  gap: '10px',
                  background: themeColors.background,
                  gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                  // Ensure fonts load if they are external
                  fontFamily: "'Noto Sans TC', sans-serif" // Explicitly set font family
              });
  
               // --- Add Title and Footer (similar to original) ---
               const titleText = label ? `${label.toUpperCase()} - 單字牆` : '單字牆';
               const titleDiv = document.createElement('div');
               titleDiv.className = 'word-wall-title';
               titleDiv.innerHTML = `<i class="fas fa-book" style="font-family: 'Font Awesome 6 Free'; font-weight: 900;"></i> ${titleText}`; // Include Font Awesome style if needed
               Object.assign(titleDiv.style, { /* Copy styles from original CSS */
                   position: 'absolute', top: '30px', left: '0', right: '0', textAlign: 'center',
                   color: themeColors.textColor || '#ffffff', fontSize: '32px', fontWeight: 'bold',
                   textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', zIndex: '1', display: 'flex',
                   alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-md)'
               });
               tempContainer.appendChild(titleDiv);
  
               const footerDiv = document.createElement('div');
               footerDiv.className = 'word-wall-footer';
               footerDiv.textContent = 'Junyi Academy 均一教育平台';
               Object.assign(footerDiv.style, { /* Copy styles from original CSS */
                   position: 'absolute', bottom: '30px', left: '0', right: '0', textAlign: 'center',
                   color: themeColors.textColor ? 'rgba(0,0,0,0.4)' : 'rgba(255, 255, 255, 0.6)', // Adjust based on theme text color
                   fontSize: '18px', zIndex: '1'
               });
               tempContainer.appendChild(footerDiv);
  
  
              // --- Create and style word divs (similar to original) ---
              const baseSize = Math.min(900 / grid.cols, 36); // Recalculate base size
              wordPairs.forEach((pair, index) => {
                  const wordDiv = document.createElement('div');
                  wordDiv.className = 'word-wall-word';
  
                  let fontSize = Utils.calculateFontSize(pair.en.length, baseSize);
                  fontSize *= 1.15;
  
                  const colorIndex = index % themeColors.colors.length;
                  const themeColor = themeColors.colors[colorIndex];
                  const hue = this.calculateHue(themeColor);
  
                  const wordEnDiv = document.createElement('div');
                  wordEnDiv.className = 'wall-word-en';
                  wordEnDiv.textContent = pair.en;
                  wordEnDiv.style.fontSize = `${fontSize}px`;
                  Object.assign(wordEnDiv.style, { fontWeight: '600', width: '100%', display: 'block' });
  
  
                  let wordCnDiv = null;
                  if (pair.cn) {
                      wordCnDiv = document.createElement('div');
                      wordCnDiv.className = 'wall-word-cn';
                      wordCnDiv.textContent = pair.cn;
                      wordCnDiv.style.fontSize = `${fontSize * 0.75}px`;
                       Object.assign(wordCnDiv.style, {
                          opacity: '0.85', marginTop: 'var(--spacing-xs)', lineHeight: '1.3',
                          width: '100%', display: 'block', fontWeight: 'normal'
                       });
                  }
  
                  // Color/Style Logic (same as original)
                  let enColor = themeColors.textColor || '#ffffff'; // Default white
                  let cnColor = themeColors.textColor || '#ffffff';
                  let cnOpacity = 0.85;
                  let bgColor = `hsla(${hue}, 85%, 65%, 0.2)`;
                  let borderStyle = `3px solid hsla(${hue}, 85%, 65%, 0.6)`;
                  let boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  let textShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
  
  
                  if (theme !== 'rainbow' && theme !== 'classic') {
                      enColor = themeColor;
                      cnColor = themeColor;
                      bgColor = `hsla(${hue}, 85%, 95%, 0.8)`;
                      borderStyle = `3px solid ${themeColor}`;
                      if (themeColors.effects) {
                          boxShadow = themeColors.effects.boxShadow || boxShadow;
                          textShadow = themeColors.effects.textShadow || textShadow;
                      }
                  }
  
                  wordEnDiv.style.color = enColor;
                  wordDiv.appendChild(wordEnDiv);
  
                  if (wordCnDiv) {
                      wordCnDiv.style.color = cnColor;
                      wordCnDiv.style.opacity = String(cnOpacity);
                      wordDiv.appendChild(wordCnDiv);
                  }
  
                  Object.assign(wordDiv.style, {
                      backgroundColor: bgColor,
                      borderLeft: borderStyle,
                      borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                      boxShadow: boxShadow,
                      textShadow: textShadow,
                      borderRadius: 'var(--border-radius-md)', // Use variable or fixed value
                      padding: '15px 20px',
                      textAlign: 'center',
                      overflow: 'hidden',
                      minHeight: '60px',
                      letterSpacing: '0.5px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center' // Ensure vertical centering
                  });
                   tempContainer.appendChild(wordDiv);
              });
  
              // Append the temporary container to the document body to allow rendering
              document.body.appendChild(tempContainer);
  
              // --- Use html2canvas on the temporary container ---
              try {
                   // Add a slight delay to allow styles/fonts to potentially render
                   await new Promise(resolve => setTimeout(resolve, 100));
  
                   // Ensure html2canvas is loaded (it should be by now)
                   if (typeof html2canvas === 'undefined') {
                       throw new Error("html2canvas library is not loaded.");
                   }
  
                   const canvas = await html2canvas(tempContainer, {
                      width: 1920,
                      height: 1080,
                      scale: 1, // Use scale 1 for exact dimensions
                      backgroundColor: null, // Let container background show through
                      logging: false,
                      useCORS: true,
                      scrollX: 0,
                      scrollY: 0,
                      imageTimeout: 15000,
                      removeContainer: false // We remove it manually in finally
                   });
  
                   // Convert canvas to Blob URL
                   return new Promise((resolve, reject) => {
                       canvas.toBlob((blob) => {
                           if (blob) {
                               resolve(URL.createObjectURL(blob));
                           } else {
                               reject(new Error('Canvas toBlob failed.'));
                           }
                       }, 'image/png');
                   });
  
              } catch (error) {
                  console.error(`html2canvas failed for theme ${theme}:`, error);
                  throw new Error(`生成 ${theme} 主題圖片失敗: ${error.message}`);
              } finally {
                  // --- IMPORTANT: Clean up the temporary container ---
                   if (tempContainer.parentNode === document.body) {
                        document.body.removeChild(tempContainer);
                   }
              }
          }
  
          getThemeColorsByName(theme) {
              // Using the same theme definitions as original
              const themes = {
                  rainbow: {
                      background: 'linear-gradient(135deg, #2c3e50, #1a252f)',
                      colors: ['#ff9a9e', '#fad0c4', '#a1c4fd', '#c2e9fb'],
                      textColor: '#ffffff'
                  },
                  nature: {
                      background: 'linear-gradient(135deg, #a8e6cf, #dcedc1)',
                      colors: ['#3bb78f', '#0bab64', '#2ecc71', '#27ae60'],
                      textColor: '#2c3e50',
                      effects: { textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }
                  },
                  ocean: {
                      background: 'linear-gradient(135deg, #a8d8ea, #aa96da)',
                      colors: ['#3498db', '#2980b9', '#6c5ce7', '#4834d4'],
                      textColor: '#2c3e50',
                      effects: { textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }
                  },
                  candy: {
                      background: 'linear-gradient(135deg, #ffd3b6, #ffaaa5)',
                      colors: ['#ff7675', '#e84393', '#fd79a8'],
                      textColor: '#2c3e50',
                      effects: { textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }
                  },
                  tech: { // Added tech theme based on CSS
                      background: 'linear-gradient(135deg, #d4e6f1, #a9cce3)',
                      colors: ['#2c3e50', '#34495e', '#5d6d7e'], // Example tech colors
                      textColor: '#17202a',
                      effects: { textShadow: '0 1px 1px rgba(255, 255, 255, 0.5)', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)' }
                  },
                  classic: {
                      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                      colors: ['#6366f1', '#4f46e5', '#4338ca', '#3730a3'],
                      textColor: '#ffffff'
                  }
              };
              return themes[theme] || themes.rainbow;
          }
  
          calculateHue(hexColor) {
              if (!hexColor || !/^#[0-9a-f]{6}$/i.test(hexColor)) return 0;
              const r = parseInt(hexColor.slice(1, 3), 16) / 255;
              const g = parseInt(hexColor.slice(3, 5), 16) / 255;
              const b = parseInt(hexColor.slice(5, 7), 16) / 255;
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              const delta = max - min;
              let h = 0;
              if (delta === 0) { h = 0; }
              else if (max === r) { h = 60 * (((g - b) / delta) % 6); }
              else if (max === g) { h = 60 * ((b - r) / delta + 2); }
              else { h = 60 * ((r - g) / delta + 4); }
              h = Math.round(h);
              return h < 0 ? h + 360 : h;
          }
  
          cleanupCachedImages() {
              Object.values(this.cachedWallImages).forEach(url => {
                  if (url && typeof url === 'string' && url.startsWith('blob:')) {
                      URL.revokeObjectURL(url);
                  }
              });
              this.cachedWallImages = {};
          }
  
  
        // --- Card Generation Logic ---
  
         async handleCardGeneration() {
              const labelInput = this.root.getElementById('card-label-input');
              const generateBtn = this.root.getElementById('generate-cards-btn');
              const errorElementId = 'cards-error-message';
              const contentArea = this.root.getElementById('cards-content-area');
              const downloadContainer = this.root.getElementById('cards-download-container'); // Get download container
  
              Utils.clearErrorMessage(errorElementId);
               // Clear previous content and show loading message
               if (contentArea) contentArea.innerHTML = '<p class="placeholder-text" style="text-align: center; color: var(--text-secondary); margin-top: var(--spacing-xl);">正在載入卡片資料...</p>';
              if (generateBtn) generateBtn.disabled = true;
               if (downloadContainer) downloadContainer.style.display = 'none'; // Hide download btn initially
  
  
              const label = labelInput.value.trim();
              if (!label) {
                  Utils.displayErrorMessage(errorElementId, '請輸入有效的 Google Sheet 單元標籤。');
                   if (contentArea) contentArea.innerHTML = '<p class="placeholder-text error" style="text-align: center; color: var(--danger-dark); margin-top: var(--spacing-xl);">請先輸入單元標籤。</p>';
                  if (generateBtn) generateBtn.disabled = false;
                  return;
              }
  
              this.lastUsedLabel = label;
  
              try {
                  await this.loadAndProcessCardData(label); // Use the refactored method
                  this.renderCards(this.vocabularyData); // Render using the loaded data
                  Utils.showNotification(`"${label}" 的單字卡資料已成功載入。`, 'success');
                   // Show download button only if cards were rendered successfully
                  if (contentArea && contentArea.querySelector('.vocabulary-card')) {
                      if (downloadContainer) downloadContainer.style.display = 'flex';
                  }
  
              } catch (error) {
                  console.error('載入或處理卡片資料失敗:', error);
                  // Utils.displayErrorMessage(errorElementId, `處理失敗: ${error.message}`); // Display error in designated area
                   if (contentArea) contentArea.innerHTML = `<p class="placeholder-text error" style="text-align: center; color: var(--danger-dark); margin-top: var(--spacing-xl);">無法載入卡片資料：${error.message}</p>`; // Show error in content area
                   if (downloadContainer) downloadContainer.style.display = 'none'; // Hide download button on error
              } finally {
                   if (generateBtn) generateBtn.disabled = false;
              }
         }
  
          setupCardGeneration() {
              const generateBtn = this.root.getElementById('generate-cards-btn');
              const labelInput = this.root.getElementById('card-label-input');
  
              if (generateBtn) {
                  generateBtn.addEventListener('click', Utils.debounce(this.handleCardGeneration, 300));
              }
              if (labelInput) {
                  labelInput.addEventListener('keypress', (e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          this.handleCardGeneration();
                      }
                  });
                  labelInput.addEventListener('input', () => Utils.clearErrorMessage('cards-error-message'));
              }
          }
  
         async loadAndProcessCardData(label) {
             // This method fetches data and stores it in this.vocabularyData
             // It's called by handleCardGeneration
             Utils.showLoading(true, `正在從 Google Sheet 載入標籤 \"${label}\" 的卡片資料...`);
             const errorElementId = 'cards-error-message';
             Utils.clearErrorMessage(errorElementId);
  
             try {
                 const url = `https://docs.google.com/spreadsheets/d/${CONSTANTS.SPREADSHEET_ID}/export?format=csv&gid=${CONSTANTS.GID}`;
                 const response = await fetch(url);
                 if (!response.ok) throw new Error(`無法載入試算表資料 (HTTP ${response.status})。`);
  
                 const csvText = await response.text();
                 if (!csvText?.trim()) throw new Error('從 Google Sheet 獲取的資料為空。');
  
                  // Use PapaParse (assuming it's globally available via loaded script)
                  const { data, errors } = Papa.parse(csvText, { header: false });
  
                 if (errors.length > 0) console.warn("CSV 解析時發生錯誤:", errors);
                 if (!data || data.length < 2) throw new Error('解析後的資料格式不符或沒有資料列。'); // Need at least header + data
  
                 // --- Original logic to find label and filter ---
                 const headerRow = data.shift() || []; // Get header row
                 if (headerRow.length === 0) throw new Error('無法讀取有效的表頭。');
                  console.log('Fetched Header Row (loadAndProcessCardData):', headerRow);
  
                  // Find label column index dynamically
                  const labelIndex = headerRow.findIndex(h => h?.trim().toLowerCase() === 'label');
                  if (labelIndex === -1) throw new Error('試算表中找不到 "Label" 欄位。請確保第一列包含 "Label" 標題。');
  
                  // Filter data rows based on the label in the correct column
                  const filteredData = data.filter(row => row[labelIndex]?.trim().toLowerCase() === label.toLowerCase());
  
                  if (filteredData.length === 0) {
                      // Try fetching labels again in case the list was outdated
                      await this.fetchAllSheetLabels();
                      if(this.availableSheetLabels.includes(label)){
                           throw new Error(`在 Google Sheet 中找到標籤 \"${label}\" 但無對應資料列。請檢查試算表內容。`);
                      } else {
                           throw new Error(`在 Google Sheet 中找不到標籤 (Label) 為 \"${label}\" 的資料。請檢查標籤名稱是否正確，或從建議列表中選擇。`);
                      }
                  }
  
                 // Check if filtered data has content beyond just the label column
                 // const hasContent = filteredData.some(row => row.filter((_, idx) => idx !== labelIndex).some(cell => cell?.trim()));
                 // if (!hasContent) throw new Error(`標籤 "${label}" 的資料列似乎是空的 (除了 Label 欄)。`);
  
                 // Store the original header and the filtered data rows
                 this.vocabularyData = [headerRow, ...filteredData];
  
             } catch (error) {
                 console.error('載入卡片資料失敗:', error);
                 Utils.displayErrorMessage(errorElementId, `載入卡片資料失敗：${error.message}`);
                 throw error; // Re-throw
             } finally {
                 Utils.showLoading(false);
             }
         }
  
        renderCards(vocabularyData) {
             const contentArea = this.root.getElementById('cards-content-area');
             if (!contentArea) return;
  
             if (!vocabularyData || vocabularyData.length < 2) { // Need header + data
                 contentArea.innerHTML = '<p class="placeholder-text" style="text-align: center; color: var(--text-secondary); margin-top: var(--spacing-xl);">沒有可顯示的卡片資料。</p>';
                 return;
             }
  
             const header = vocabularyData[0];
             const dataRows = vocabularyData.slice(1);
  
             // Find column indices dynamically from header
              const findIndex = (names) => {
                  const lowerCaseNames = names.map(name => name.toLowerCase());
                  for(let i=0; i < header.length; i++){
                      const colName = header[i]?.trim().toLowerCase();
                      if(colName && lowerCaseNames.includes(colName)){
                           console.log(`Found column "${header[i]}" for potential names [${names.join(', ')}] at index ${i}`);
                           return i;
                      }
                  }
                   console.warn(`Column not found for potential names [${names.join(', ')}] in header:`, header);
                  return -1; // Return -1 if not found
              };
  
  
             const englishIndex = findIndex(['英文', 'english']);
             const pronunciationIndex = findIndex(['音標', 'pronunciation']);
             const translationIndex = findIndex(['中譯', 'translation']);
             const exampleIndex = findIndex(['例句', 'example']);
             const exampleTranslationIndex = findIndex(['翻譯', 'exampletranslation']);
             const markStartIndex = findIndex(['mark_start', 'mark_strat']); // Allow typo
             const markEndIndex = findIndex(['mark_end']);
  
  
             if (englishIndex === -1) {
                 contentArea.innerHTML = '<p class="placeholder-text error" style="text-align: center; color: var(--danger-dark); margin-top: var(--spacing-xl);">錯誤：試算表中缺少 "英文" 或 "English" 欄位。</p>';
                 return;
             }
  
             let cardHtml = '';
             dataRows.forEach((row, index) => {
                 const english = row[englishIndex]?.trim() || '';
                 if (!english) return; // Skip row if English word is missing
  
                 const pronunciation = pronunciationIndex > -1 ? row[pronunciationIndex]?.trim() || '' : '';
                 const translation = translationIndex > -1 ? row[translationIndex]?.trim() || '' : '';
                 const example = exampleIndex > -1 ? row[exampleIndex]?.trim() || '' : '';
                 const exampleTranslation = exampleTranslationIndex > -1 ? row[exampleTranslationIndex]?.trim() || '' : '';
                 const markStart = markStartIndex > -1 ? row[markStartIndex]?.trim() : '';
                 const markEnd = markEndIndex > -1 ? row[markEndIndex]?.trim() : '';
  
                 // Process example sentence highlighting
                 let markedExample = example;
                 if (example && markStart && markEnd) {
                     const words = example.split(' ');
                     const start = parseInt(markStart) - 1;
                     const end = parseInt(markEnd) - 1;
  
                     if (!isNaN(start) && !isNaN(end) && start >= 0 && start <= end && end < words.length) {
                         words[start] = `<span class="highlight">${words[start]}`; // Class defined in shadow CSS
                         words[end] = `${words[end]}</span>`;
                         markedExample = words.join(' ');
                     } else {
                         console.warn(`無效的標記索引 (Start: ${markStart}, End: ${markEnd}) for example: \"${example}\"`);
                     }
                 }
  
                 cardHtml += `
                   <article class="vocabulary-card card" id="card-${index}" aria-labelledby="card-title-${index}">
                     <h3 id="card-title-${index}">${english}</h3>
                     ${pronunciation ? `<div class="vocabulary-item"><strong>音標:</strong> ${pronunciation}</div>` : ''}
                     ${translation ? `<div class="vocabulary-item"><strong>中譯:</strong> ${translation}</div>` : ''}
                     ${example ? `
                       <div class="example">
                         <div>${markedExample || example}</div>
                         ${exampleTranslation ? `<div>${exampleTranslation}</div>` : ''}
                       </div>
                     ` : ''}
                   </article>
                 `;
             });
  
             if (cardHtml) {
                 contentArea.innerHTML = `<div class="vocabulary-grid">${cardHtml}</div>`;
                 // Ensure download button listener is attached if it exists
                 const downloadBtn = this.root.getElementById('download-cards-btn');
                 if (downloadBtn) {
                     // Remove previous listener to avoid duplicates if re-rendering
                     downloadBtn.removeEventListener('click', this.downloadAllCards);
                     downloadBtn.addEventListener('click', this.downloadAllCards);
                 }
                  // Show the container holding the download button
                  const downloadContainer = this.root.getElementById('cards-download-container');
                  if (downloadContainer) downloadContainer.style.display = 'flex';
  
             } else {
                 contentArea.innerHTML = '<p class="placeholder-text" style="text-align: center; color: var(--text-secondary); margin-top: var(--spacing-xl);">在此標籤下未找到有效的單字卡資料。</p>';
                  // Hide the container holding the download button
                  const downloadContainer = this.root.getElementById('cards-download-container');
                  if (downloadContainer) downloadContainer.style.display = 'none';
             }
         }
  
  
         async dataURLToBlob(dataURL) {
            try {
                 const response = await fetch(dataURL);
                 if (!response.ok) {
                     throw new Error(`Failed to fetch data URL (status: ${response.status})`);
                 }
                 return await response.blob();
            } catch (error) {
                 console.error("Error converting data URL to Blob:", error);
                 Utils.showNotification(`圖片轉換失敗: ${error.message}`, 'error');
                 throw error; // Re-throw
            }
          }
  
         async downloadAllCards() {
             const cards = this.root.querySelectorAll('.vocabulary-card');
             const downloadBtn = this.root.getElementById('download-cards-btn'); // Button inside shadow DOM
             if (!downloadBtn) return;
  
             const originalText = downloadBtn.innerHTML;
             downloadBtn.disabled = true;
             downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 準備中...';
  
              // --- Create Preview Layer (appended to document.body) ---
              const previewLayerId = 'vocab-export-preview-layer';
               let previewLayer = document.getElementById(previewLayerId);
               if (previewLayer) previewLayer.remove(); // Remove previous one if exists
  
               previewLayer = document.createElement('div');
               previewLayer.id = previewLayerId;
               previewLayer.className = 'preview-layer'; // Use global class or style directly
                Object.assign(previewLayer.style, {
                   position: 'fixed', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: '9999',
                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                   padding: 'var(--spacing-lg)', overflow: 'auto' // animation: 'fadeIn 0.3s ease forwards';
               });
  
  
             const controlPanel = document.createElement('div');
             controlPanel.className = 'preview-controls'; // Use global class or style directly
               Object.assign(controlPanel.style, {
                   position: 'sticky', top: '0', width: '100%', maxWidth: '1400px',
                   backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: 'var(--spacing-md) var(--spacing-lg)',
                   borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-xl)', display: 'flex',
                   justifyContent: 'space-between', alignItems: 'center', zIndex: '1', backdropFilter: 'blur(5px)',
                   boxShadow: 'var(--shadow-md)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-light)'
               });
  
             const closeBtn = document.createElement('button');
             closeBtn.className = 'btn btn-secondary btn-sm'; // Use base btn styles + sm variant
               Object.assign(closeBtn.style, { /* Add .btn styles if needed */
                  padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: 'var(--font-size-sm)',
                  borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)'
               });
             closeBtn.innerHTML = '<i class="fas fa-times"></i> 關閉';
             closeBtn.onclick = () => previewLayer.remove();
  
             const batchDownloadBtn = document.createElement('button');
             batchDownloadBtn.className = 'btn btn-primary btn-sm'; // Use base btn styles + sm variant
              Object.assign(batchDownloadBtn.style, { /* Add .btn styles if needed */
                  padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: 'var(--font-size-sm)',
                  borderRadius: 'var(--border-radius-sm)', background: 'var(--primary-color)',
                  color: 'var(--text-light)', border: '1px solid transparent', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)'
               });
             batchDownloadBtn.innerHTML = '<i class="fas fa-file-archive"></i> 下載 ZIP';
             batchDownloadBtn.disabled = true;
             batchDownloadBtn.style.opacity = '0.7';
  
             const statusText = document.createElement('div');
             statusText.className = 'status-text'; // Use global class or style directly
               Object.assign(statusText.style, {
                   flexGrow: '1', margin: '0 var(--spacing-lg)', fontSize: 'var(--font-size-sm)',
                   textAlign: 'left', color: 'var(--text-light)'
               });
             statusText.textContent = '生成預覽中...';
  
             const btnGroup = document.createElement('div');
             btnGroup.className = 'btn-group';
             btnGroup.style.display = 'flex';
             btnGroup.style.gap = 'var(--spacing-md)';
             btnGroup.appendChild(batchDownloadBtn);
             btnGroup.appendChild(closeBtn);
  
             controlPanel.appendChild(statusText);
             controlPanel.appendChild(btnGroup);
  
             const previewContainer = document.createElement('div');
             previewContainer.className = 'preview-container'; // Use global class or style directly
              Object.assign(previewContainer.style, {
                   display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                   gap: 'var(--spacing-lg)', width: '100%', maxWidth: '1400px', padding: '0'
              });
  
             previewLayer.appendChild(controlPanel);
             previewLayer.appendChild(previewContainer);
             document.body.appendChild(previewLayer); // Append preview layer to light DOM
  
             const imageDataArray = [];
  
             try {
                 // Ensure JSZip is loaded
                 if (typeof JSZip === 'undefined') {
                     Utils.showNotification('錯誤：JSZip 庫未載入，無法批次下載。', 'error');
                     throw new Error('JSZip not loaded');
                 }
  
                 // --- Process cards using html2canvas on temporary elements ---
                 for (let i = 0; i < cards.length; i++) {
                     const card = cards[i];
                     statusText.textContent = `處理中 ${i + 1}/${cards.length}...`;
  
                     const cardClone = card.cloneNode(true); // Clone card from shadow DOM
  
                      // --- Create temporary container for rendering ---
                      const tempRenderId = `temp-card-render-${i}`;
                      const tempRenderContainer = document.createElement('div');
                      tempRenderContainer.id = tempRenderId;
                      // Apply styles needed for 1920x1080 capture
                      Object.assign(tempRenderContainer.style, {
                          width: '1920px', height: '1080px', position: 'fixed',
                          top: '-9999px', left: '-9999px', // Off-screen
                          backgroundColor: '#121212', // Dark background for contrast
                          padding: '0', boxSizing: 'border-box', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                          fontFamily: "'Noto Sans TC', sans-serif" // Ensure font
                      });
  
                      // --- Style the cloned card for capture ---
                       Object.assign(cardClone.style, {
                           width: '96%', height: '96%', margin: '0', padding: '60px', boxSizing: 'border-box',
                           fontSize: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                           borderRadius: '20px', boxShadow: '0 0 50px rgba(0,0,0,0.4)',
                           background: 'linear-gradient(to bottom right, #0f172a, #1e293b)', color: '#e2e8f0',
                           position: 'relative' // Needed for absolute positioned children
                       });
  
                       // Style internal elements (title, items, example)
                       const title = cardClone.querySelector('h3');
                       if (title) Object.assign(title.style, { fontSize: '96px', color: '#38bdf8', borderBottom: '4px solid rgba(59, 130, 246, 0.3)', paddingBottom: '15px', marginBottom: '15px', fontWeight: 'bold', letterSpacing: '1px', textShadow: '0 2px 10px rgba(59, 130, 246, 0.3)' });
  
                       cardClone.querySelectorAll('.vocabulary-item').forEach(item => {
                           Object.assign(item.style, { margin: '8px 0', fontSize: '64px' });
                           const strong = item.querySelector('strong');
                           if (strong) Object.assign(strong.style, { color: '#64748b', fontWeight: '500', display: 'inline-block', width: '180px', opacity: '0.75', fontSize: '42px', verticalAlign: 'middle' });
                       });
  
                       const example = cardClone.querySelector('.example');
                       if (example) {
                           Object.assign(example.style, { margin: '15px 0', padding: '25px', borderLeft: '8px solid rgba(59, 130, 246, 0.4)', borderRadius: '0 15px 15px 0', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)' });
                           const exampleTexts = example.children;
                           if (exampleTexts.length > 0) {
                               Object.assign(exampleTexts[0].style, { fontSize: '56px', lineHeight: '1.4', marginBottom: '15px', fontStyle: 'italic', color: '#cbd5e1' });
                                // Style highlight span
                                const highlightSpan = exampleTexts[0].querySelector('.highlight');
                                if (highlightSpan) Object.assign(highlightSpan.style, { backgroundColor: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', padding: '0 8px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', textShadow: '0 0 8px rgba(56, 189, 248, 0.4)', boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)' });
  
                               if (exampleTexts.length > 1) Object.assign(exampleTexts[1].style, { fontSize: '52px', color: '#94a3b8', fontWeight: '500', opacity: '0.85' });
                           }
                       }
  
                       // Add decorations and footer (as in original downloadAllCards)
                       const decoration = document.createElement('div');
                       Object.assign(decoration.style, { position: 'absolute', top: '0', right: '0', width: '250px', height: '250px', background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)', zIndex: '0' });
                       const decoration2 = document.createElement('div');
                        Object.assign(decoration2.style, { position: 'absolute', bottom: '0', left: '0', width: '200px', height: '200px', background: 'radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0) 70%)', zIndex: '0' });
                       const footer = document.createElement('div');
                        Object.assign(footer.style, { position: 'absolute', top: '40px', right: '40px', fontSize: '24px', color: 'rgba(100, 116, 139, 0.5)', fontFamily: 'Arial, sans-serif', letterSpacing: '1px' });
                       footer.innerHTML = 'Junyi Academy 均一教育平台';
                       const lightEffect = document.createElement('div');
                        Object.assign(lightEffect.style, { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, rgba(0, 0, 0, 0) 70%)', zIndex: '0', pointerEvents: 'none'});
  
                       cardClone.appendChild(decoration);
                       cardClone.appendChild(decoration2);
                       cardClone.appendChild(footer);
                       cardClone.appendChild(lightEffect);
  
  
                      tempRenderContainer.appendChild(cardClone);
                      document.body.appendChild(tempRenderContainer); // Append to body for render
  
                      // --- html2canvas capture ---
                       await new Promise(resolve => setTimeout(resolve, 50)); // Short delay for rendering
  
                       const canvas = await html2canvas(tempRenderContainer, {
                           scale: 1, // Capture at target size
                           backgroundColor: null, // Use container background
                           logging: false,
                           width: 1920, height: 1080,
                           useCORS: true, // Important if card includes external images
                           imageTimeout: 15000
                       });
  
                       const imgDataUrl = canvas.toDataURL('image/png');
                       const blob = await this.dataURLToBlob(imgDataUrl);
  
                       // --- Generate filename ---
                       const cardTitleElement = card.querySelector('h3'); // Get title from original card in shadow DOM
                       const englishWord = cardTitleElement ? cardTitleElement.textContent.trim().replace(/[^a-z0-9_\-]/gi, '_').substring(0, 30) : `card_${i + 1}`;
                       const totalDigits = Math.max(2, Math.ceil(Math.log10(cards.length + 1)));
                       const paddedIndex = String(i + 1).padStart(totalDigits, '0');
                       const filename = `#${paddedIndex}_${englishWord}.png`;
  
                      imageDataArray.push({ name: filename, data: blob });
  
                       // --- Create preview element in the light DOM layer ---
                       const previewCard = document.createElement('div');
                       previewCard.className = 'preview-card'; // Use global class or style directly
                        Object.assign(previewCard.style, {
                           position: 'relative', background: 'var(--bg-card)', borderRadius: 'var(--border-radius-md)',
                           boxShadow: 'var(--shadow-md)', overflow: 'hidden', transition: 'var(--transition-fast)',
                           border: '1px solid var(--border-color)'
                        });
                        previewCard.addEventListener('mouseover', function() { Object.assign(this.style, { boxShadow: 'var(--shadow-lg)', transform: 'translateY(-3px)'}); });
                        previewCard.addEventListener('mouseout', function() { Object.assign(this.style, { boxShadow: 'var(--shadow-md)', transform: 'translateY(0)'}); });
  
  
                       const img = document.createElement('img');
                       img.src = imgDataUrl;
                       Object.assign(img.style, { display: 'block', width: '100%', height: 'auto' });
                       previewCard.appendChild(img);
  
                       const overlay = document.createElement('div');
                       overlay.className = 'preview-overlay'; // Use global class or style directly
                        Object.assign(overlay.style, {
                           position: 'absolute', bottom: '0', left: '0', right: '0',
                           background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
                           color: 'var(--text-light)', padding: 'var(--spacing-lg) var(--spacing-md)',
                           paddingTop: 'var(--spacing-2xl)', display: 'flex', justifyContent: 'space-between',
                           alignItems: 'flex-end', opacity: '0', transition: 'opacity var(--transition-fast)',
                           fontSize: 'var(--font-size-sm)', fontWeight: '500'
                        });
                        previewCard.addEventListener('mouseover', () => overlay.style.opacity = '1');
                        previewCard.addEventListener('mouseout', () => overlay.style.opacity = '0');
  
  
                       const cardIndexText = document.createElement('span');
                       cardIndexText.textContent = `卡片 ${i + 1}`;
                       overlay.appendChild(cardIndexText);
  
  
                       const downloadLink = document.createElement('a');
                       downloadLink.href = URL.createObjectURL(blob); // Create temporary URL for download
                       downloadLink.download = filename;
                       downloadLink.innerHTML = '<i class="fas fa-download"></i>';
                       downloadLink.className = 'preview-download'; // Use global class or style directly
                       Object.assign(downloadLink.style, {
                           color: 'var(--text-light)', background: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--border-radius-full)',
                           width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                           transition: 'var(--transition-fast)', textDecoration: 'none', flexShrink: '0'
                       });
                        downloadLink.addEventListener('mouseover', function() { Object.assign(this.style, { background: 'rgba(255, 255, 255, 0.4)', transform: 'scale(1.1)'}); });
                        downloadLink.addEventListener('mouseout', function() { Object.assign(this.style, { background: 'rgba(255, 255, 255, 0.2)', transform: 'scale(1)'}); });
  
                       overlay.appendChild(downloadLink);
                       previewCard.appendChild(overlay);
  
                      previewContainer.appendChild(previewCard);
  
                      // --- Clean up temporary render container ---
                       document.body.removeChild(tempRenderContainer);
  
                      // Yield slightly to prevent blocking UI thread too long
                       if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 10));
                 }
  
                 batchDownloadBtn.disabled = false;
                 batchDownloadBtn.style.opacity = '1';
                 batchDownloadBtn.onclick = () => this.downloadZipFile(imageDataArray);
                 statusText.textContent = `完成 ${cards.length} 張卡片。可單獨下載或批次下載 ZIP。`;
  
             } catch (error) {
                 console.error('生成卡片圖片失敗:', error);
                 statusText.textContent = `處理錯誤: ${error.message}`;
                 Utils.showNotification(`生成卡片預覽時出錯: ${error.message}`, 'error');
             } finally {
                 downloadBtn.disabled = false;
                 downloadBtn.innerHTML = originalText;
             }
         }
  
  
          async loadJSZip() {
            // Check if JSZip is already loaded (globally)
            if (window.JSZip) {
                return Promise.resolve(window.JSZip);
            }
            // If not, attempt to load it (this assumes the script tag was included in loadResourcesAndInit)
            return new Promise((resolve, reject) => {
               // Wait a bit for potentially slow script loading
               let attempts = 0;
               const interval = setInterval(() => {
                   if (window.JSZip) {
                       clearInterval(interval);
                       resolve(window.JSZip);
                   } else if (attempts > 20) { // Wait up to 2 seconds
                       clearInterval(interval);
                       reject(new Error('無法載入 JSZip 庫 (逾時)'));
                   }
                   attempts++;
               }, 100);
            });
          }
  
  
         async downloadZipFile(imageDataArray) {
             Utils.showLoading(true, '正在建立 ZIP 檔案...');
             try {
                  // Ensure JSZip is loaded before proceeding
                  await this.loadJSZip(); // Use the async loader
  
                 const zip = new JSZip();
  
                 imageDataArray.forEach(item => {
                     zip.file(item.name, item.data, { binary: true }); // Add file to zip
                 });
  
                 const content = await zip.generateAsync({
                     type: 'blob',
                     compression: 'DEFLATE',
                     compressionOptions: { level: 6 } // Balance between speed and compression
                 });
  
                 // Trigger download
                 const link = document.createElement('a');
                 const zipUrl = URL.createObjectURL(content);
                 link.href = zipUrl;
                 const labelName = this.lastUsedLabel.replace(/[^a-z0-9_\-]/gi, '_').substring(0, 30) || 'cards';
                 link.download = `VocabExport_${labelName}_Cards.zip`; // Filename for the zip
                 document.body.appendChild(link); // Required for Firefox
                 link.click();
                 document.body.removeChild(link);
  
                 // Clean up the temporary URL
                 setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
                 Utils.showNotification('ZIP 檔案下載已開始。', 'success');
  
             } catch (error) {
                 console.error('創建 ZIP 文件失敗:', error);
                 Utils.showNotification(`批次下載失敗: ${error.message}`, 'error');
             } finally {
                 Utils.showLoading(false);
             }
         }
  
          async fetchAllSheetLabels() {
              try {
                  const url = `https://docs.google.com/spreadsheets/d/${CONSTANTS.SPREADSHEET_ID}/export?format=csv&gid=${CONSTANTS.GID}`;
                  const response = await fetch(url);
                  if (!response.ok) {
                      throw new Error(`無法載入試算表標籤資料 (HTTP ${response.status})。`);
                  }
                  const csvText = await response.text();
                  if (!csvText?.trim()) {
                      throw new Error('從 Google Sheet 獲取的標籤資料為空。');
                  }
  
                  // Use PapaParse
                  const { data, errors } = Papa.parse(csvText, { header: false });
                  if (errors.length > 0) console.warn("CSV 解析時發生錯誤 (Labels):", errors);
                  if (!data || data.length === 0) throw new Error('解析後的標籤資料為空。');
  
                  // Find label column index dynamically from header (first row)
                   const headerRow = data[0] || [];
                   const labelIndex = headerRow.findIndex(h => h?.trim().toLowerCase() === 'label');
  
                   let labels = [];
                   if (labelIndex !== -1) {
                       // Extract labels from the identified column, skipping header
                       labels = data.slice(1)
                           .map(row => row[labelIndex]?.trim())
                           .filter(Boolean);
                   } else {
                        // Fallback to assuming first column if 'Label' header not found
                        console.warn('未找到 "Label" 欄位標頭，將使用第一欄作為標籤。');
                        labels = data.slice(1) // Skip potential header row
                            .map(row => row[0]?.trim())
                            .filter(Boolean);
                   }
  
  
                  this.availableSheetLabels = [...new Set(labels)];
                  this.availableSheetLabels.sort();
  
                  console.log('Fetched unique labels:', this.availableSheetLabels);
                  this.populateLabelDatalist();
  
              } catch (error) {
                  console.error('載入 Google Sheet 標籤失敗:', error);
                  Utils.showNotification(`無法載入標籤建議列表: ${error.message}`, 'error');
              }
          }
  
          populateLabelDatalist() {
              const datalistElement = this.root.getElementById('sheet-labels-datalist'); // Use shadow root query
              if (!datalistElement) {
                  console.error('找不到 Datalist 元素 (#sheet-labels-datalist)');
                  return;
              }
              datalistElement.innerHTML = ''; // Clear existing
              const fragment = document.createDocumentFragment();
              this.availableSheetLabels.forEach(label => {
                  const option = document.createElement('option');
                  option.value = label;
                  fragment.appendChild(option);
              });
              datalistElement.appendChild(fragment);
              console.log(`Datalist populated with ${this.availableSheetLabels.length} labels.`);
          }
  
        // Setup for Usage Toggles (from the second script in original HTML)
        setupUsageToggles() {
            // Retrieve initial state from localStorage (global)
            // Using a unique key for this component instance might be better if multiple instances exist
            const visitedKey = 'vocabexport-usage-visited'; // Use a unique key if necessary
            const visited = localStorage.getItem(visitedKey);
            const initiallyOpen = !visited;
            if (!visited) {
                localStorage.setItem(visitedKey, 'true');
            }
  
            this.root.querySelectorAll('.usage-steps').forEach(section => {
                const header = section.querySelector('h2.usage-toggle');
                const content = section.querySelector('.steps');
                const icon = header?.querySelector('i.fas'); // Check if header exists
  
                if (header && content && icon) { // Ensure all elements are found
                     // Set initial state based on localStorage
                    if (!initiallyOpen) {
                      content.style.display = 'none';
                      icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
                      header.setAttribute('aria-expanded', 'false'); // Set ARIA state
                    } else {
                        content.style.display = ''; // Explicitly show if initially open
                        icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
                        header.setAttribute('aria-expanded', 'true');
                    }
  
  
                    header.addEventListener('click', () => {
                        const isHidden = content.style.display === 'none';
                        if (isHidden) {
                            content.style.display = '';
                            icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
                             header.setAttribute('aria-expanded', 'true');
                        } else {
                            content.style.display = 'none';
                            icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
                             header.setAttribute('aria-expanded', 'false');
                        }
                    });
  
                     // Add keyboard support for toggle
                     header.addEventListener('keydown', (event) => {
                         if (event.key === 'Enter' || event.key === ' ') {
                             event.preventDefault();
                             header.click(); // Trigger the click handler
                         }
                     });
                } else {
                    console.warn('Could not find all elements for usage toggle:', section);
                }
            });
        }
  
  
      } // End of VocabAppLogic class
  
      // Initialize the app logic within the component's scope
      new VocabAppLogic(shadow);
  
      // --- End of original script content ---
    }
  
    // Optional: Add lifecycle callbacks if needed (e.g., disconnectedCallback for cleanup)
     disconnectedCallback() {
        // Clean up event listeners, intervals, or object URLs if necessary
        console.log('VocabExportAppElement removed from DOM');
        // Example: Remove global elements created by the component
        const loading = document.getElementById('vocab-export-loading');
        if(loading) loading.remove();
        const notifications = document.getElementById('vocab-export-notification-area');
        if(notifications) notifications.remove();
        const modals = document.querySelectorAll('.word-wall-modal, .preview-layer'); // Select by class
        modals.forEach(modal => modal.remove());
  
        // Revoke any potentially lingering blob URLs
        // This requires tracking them, e.g., storing in an array in VocabAppLogic
        // this.appInstance?.cleanupBlobUrls(); // Assuming appInstance holds the logic class
     }
  
  } // End of VocabExportAppElement class
  
  // Define the custom element
  customElements.define('vocab-export-app', VocabExportAppElement);
  
  // --- Helper function outside class (if needed globally, otherwise move inside) ---
  // Note: Keep utility functions inside VocabAppLogic or pass shadowRoot context if needed.
  