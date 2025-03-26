// File data structure
class FileData {
  constructor(id, name, language, content = '') {
    this.id = id;
    this.name = name;
    this.language = language;
    this.content = content;
  }
}

// Main editor class
class CodeEditor {
  constructor() {
    // DOM elements
    this.sidebarToggle = document.getElementById('toggle-sidebar');
    this.sidebar = document.getElementById('sidebar');
    this.fileList = document.getElementById('file-list');
    this.editorTabs = document.getElementById('editor-tabs');
    this.editorArea = document.getElementById('editor-area');
    this.previewFrame = document.getElementById('preview-frame');
    this.previewContainer = document.getElementById('preview-container');
    this.newFileBtn = document.getElementById('new-file-btn');
    this.modal = document.getElementById('new-file-modal');
    this.closeModal = document.querySelector('.close');
    this.createFileBtn = document.getElementById('create-file-btn');
    this.fileNameInput = document.getElementById('file-name');
    this.fileTypeButtons = document.querySelectorAll('.file-type-btn');
    this.togglePreviewBtn = document.getElementById('toggle-preview-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.exportBtn = document.getElementById('export-btn');
    this.importBtn = document.getElementById('import-btn');
    this.importInput = document.getElementById('import-input');
    this.refreshPreviewBtn = document.getElementById('refresh-preview');
    this.toggleThemeBtn = document.getElementById('toggle-theme-btn');
    this.contextMenu = document.getElementById('context-menu');
    this.renameFileBtn = document.getElementById('rename-file-btn');
    this.deleteFileBtn = document.getElementById('delete-file-btn');
    this.renameOverlay = document.getElementById('rename-overlay');
    this.renameInput = document.getElementById('rename-input');
    this.cancelRenameBtn = document.getElementById('cancel-rename-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-preview');
    
    // State
    this.files = [];
    this.activeFileId = null;
    this.activeFileType = 'html';
    this.isDarkTheme = true;
    this.rightClickedFileId = null;
    this.isPreviewVisible = true;
    
    // Default files
    this.defaultFiles = [
      new FileData(
        'html-1',
        'index.html',
        'html',
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>Start coding your amazing project!</p>\n  \n  <script src="script.js"></script>\n</body>\n</html>'
      ),
      new FileData(
        'css-1',
        'styles.css',
        'css',
        'body {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  line-height: 1.6;\n  color: #333;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\nh1 {\n  color: #2563eb;\n}\n'
      ),
      new FileData(
        'js-1',
        'script.js',
        'js',
        '// Your JavaScript code goes here\nconsole.log("Hello from JavaScript!");\n\n// Example function\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Test the function\nconsole.log(greet("Coder"));\n'
      )
    ];
    
    // Initialize
    this.init();
  }
  
  init() {
    // Load files from localStorage or use defaults
    this.loadFromLocalStorage();
    
    // Initialize UI
    this.renderFileList();
    this.updateEditorTabs();
    this.updatePreview();
    
    // Set active file
    if (this.files.length > 0 && !this.activeFileId) {
      this.setActiveFile(this.files[0].id);
    }
    
    // Event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Sidebar toggle
    this.sidebarToggle.addEventListener('click', () => {
      this.sidebar.classList.toggle('hidden');
    });
    
    // New file modal
    this.newFileBtn.addEventListener('click', () => {
      this.openModal();
    });
    
    this.closeModal.addEventListener('click', () => {
      this.closeModalHandler();
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModalHandler();
      }
    });
    
    // File type selection
    this.fileTypeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.fileTypeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.activeFileType = button.dataset.type;
      });
    });
    
    // Create file
    this.createFileBtn.addEventListener('click', () => {
      this.createNewFile();
    });
    
    // Toggle preview
    this.togglePreviewBtn.addEventListener('click', () => {
      this.togglePreview();
    });
    
    // Save to localStorage
    this.saveBtn.addEventListener('click', () => {
      this.saveToLocalStorage();
    });
    
    // Export files
    this.exportBtn.addEventListener('click', () => {
      this.exportFiles();
    });
    
    // Import files
    this.importInput.addEventListener('change', (e) => {
      this.importFiles(e.target.files);
    });
    
    // Refresh preview
    this.refreshPreviewBtn.addEventListener('click', () => {
      this.updatePreview();
    });
    
    // Toggle theme
    this.toggleThemeBtn.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Context menu
    document.addEventListener('click', () => {
      this.hideContextMenu();
    });
    
    // Rename file
    this.renameFileBtn.addEventListener('click', () => {
      this.startRenameFile();
    });
    
    // Delete file
    this.deleteFileBtn.addEventListener('click', () => {
      this.deleteFile(this.rightClickedFileId);
    });
    
    // Cancel rename
    this.cancelRenameBtn.addEventListener('click', () => {
      this.hideRenameOverlay();
    });
    
    // Handle rename input blur
    this.renameInput.addEventListener('blur', () => {
      this.finishRenameFile();
    });
    
    // Handle rename input keydown
    this.renameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.finishRenameFile();
      } else if (e.key === 'Escape') {
        this.hideRenameOverlay();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveToLocalStorage();
      }
    });
    
    // Clear cache
    document.getElementById('clear-cache-btn').addEventListener('click', () => {
      this.clearCache();
    });
    
    // Fullscreen button
    this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
    
    // Add escape key listener to exit fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.previewContainer.classList.contains('fullscreen')) {
        this.toggleFullscreen();
      }
    });
  }
  
  // File CRUD operations
  addFile(name, language, content = '') {
    const id = `${language}-${Date.now()}`;
    const newFile = new FileData(id, name, language, content || this.getTemplateForLanguage(language, name));
    this.files.push(newFile);
    this.renderFileList();
    this.updateEditorTabs();
    this.setActiveFile(id);
    this.saveToLocalStorage();
    return id;
  }
  
  updateFile(id, content) {
    const file = this.files.find(file => file.id === id);
    if (file) {
      file.content = content;
      this.saveToLocalStorage();
      this.updatePreview();
    }
  }
  
  renameFile(id, newName) {
    const file = this.files.find(file => file.id === id);
    if (file) {
      file.name = newName;
      this.renderFileList();
      this.updateEditorTabs();
      this.saveToLocalStorage();
    }
  }
  
  deleteFile(id) {
    const fileIndex = this.files.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      this.files.splice(fileIndex, 1);
      
      // If the deleted file was active, set a new active file
      if (this.activeFileId === id) {
        this.activeFileId = this.files.length > 0 ? this.files[0].id : null;
      }
      
      this.renderFileList();
      this.updateEditorTabs();
      this.saveToLocalStorage();
      
      if (this.activeFileId) {
        this.setActiveFile(this.activeFileId);
      } else {
        this.editorArea.innerHTML = '';
      }
    }
  }
  
  setActiveFile(id) {
    this.activeFileId = id;
    
    // Update file list highlighting
    const fileItems = this.fileList.querySelectorAll('.file-item');
    fileItems.forEach(item => {
      if (item.dataset.id === id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update editor tabs
    const tabs = this.editorTabs.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
      if (tab.dataset.id === id) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Update editor content
    const file = this.files.find(file => file.id === id);
    if (file) {
      this.renderEditor(file);
    }
  }
  
  // UI rendering
  renderFileList() {
    this.fileList.innerHTML = '';
    
    this.files.forEach(file => {
      const fileItem = document.createElement('li');
      fileItem.className = 'file-item';
      fileItem.dataset.id = file.id;
      
      if (file.id === this.activeFileId) {
        fileItem.classList.add('active');
      }
      
      // File icon and name
      const fileItemLeft = document.createElement('div');
      fileItemLeft.className = 'file-item-left';
      
      const fileIcon = document.createElement('i');
      fileIcon.className = `file-icon ${file.language}`;
      
      switch (file.language) {
        case 'html':
          fileIcon.className += ' fas fa-code';
          break;
        case 'css':
          fileIcon.className += ' fas fa-file';
          break;
        case 'js':
          fileIcon.className += ' fas fa-file-code';
          break;
      }
      
      const fileName = document.createElement('span');
      fileName.className = 'file-name';
      fileName.textContent = file.name;
      
      fileItemLeft.appendChild(fileIcon);
      fileItemLeft.appendChild(fileName);
      
      // More button
      const fileActions = document.createElement('div');
      fileActions.className = 'file-actions';
      
      const moreBtn = document.createElement('button');
      moreBtn.className = 'btn btn-icon';
      moreBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
      
      fileActions.appendChild(moreBtn);
      
      fileItem.appendChild(fileItemLeft);
      fileItem.appendChild(fileActions);
      
      // Event listeners
      fileItem.addEventListener('click', () => {
        this.setActiveFile(file.id);
      });
      
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showContextMenu(e, file.id);
      });
      
      fileItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showContextMenu(e, file.id);
      });
      
      // Double click to rename
      fileName.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.rightClickedFileId = file.id;
        this.startRenameFile();
      });
      
      this.fileList.appendChild(fileItem);
    });
  }
  
  updateEditorTabs() {
    this.editorTabs.innerHTML = '';
    
    this.files.forEach(file => {
      const tab = document.createElement('div');
      tab.className = 'editor-tab';
      tab.dataset.id = file.id;
      
      if (file.id === this.activeFileId) {
        tab.classList.add('active');
      }
      
      // Icon based on file type
      const icon = document.createElement('i');
      
      switch (file.language) {
        case 'html':
          icon.className = 'fas fa-code';
          icon.style.color = '#e44d26';
          break;
        case 'css':
          icon.className = 'fas fa-file';
          icon.style.color = '#264de4';
          break;
        case 'js':
          icon.className = 'fas fa-file-code';
          icon.style.color = '#f7df1e';
          break;
      }
      
      const name = document.createElement('span');
      name.textContent = file.name;
      
      tab.appendChild(icon);
      tab.appendChild(name);
      
      tab.addEventListener('click', () => {
        this.setActiveFile(file.id);
      });
      
      this.editorTabs.appendChild(tab);
    });
  }
  
  renderEditor(file) {
    this.editorArea.innerHTML = '';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'editor-textarea';
    textarea.value = file.content;
    textarea.dataset.id = file.id;
    
    // Handle tab key
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        
        this.updateFile(file.id, textarea.value);
      }
    });
    
    // Update file content on change
    textarea.addEventListener('input', () => {
      this.updateFile(file.id, textarea.value);
    });
    
    this.editorArea.appendChild(textarea);
    
    // Focus the textarea
    textarea.focus();
  }
  
  // Generate preview HTML
  generatePreview() {
    const htmlFile = this.files.find(file => file.language === 'html');
    const cssFiles = this.files.filter(file => file.language === 'css');
    const jsFiles = this.files.filter(file => file.language === 'js');
    
    if (!htmlFile) {
      return `<html><body><h1>No HTML file found</h1><p>Create an HTML file to see the preview.</p></body></html>`;
    }
    
    let htmlContent = htmlFile.content;
    
    // Add CSS
    if (cssFiles.length > 0) {
      const cssContent = cssFiles.map(file => 
        `<style data-file="${file.name}">\n${file.content}\n</style>`
      ).join('\n');
      
      htmlContent = htmlContent.replace(
        '</head>',
        `${cssContent}\n</head>`
      );
    }
    
    // Add JavaScript
    if (jsFiles.length > 0) {
      const jsContent = jsFiles.map(file => 
        `<script data-file="${file.name}">\n${file.content}\n</script>`
      ).join('\n');
      
      htmlContent = htmlContent.replace(
        '</body>',
        `${jsContent}\n</body>`
      );
    }
    
    return htmlContent;
  }
  
  updatePreview() {
    const previewContent = this.generatePreview();
    const iframe = this.previewFrame;
    
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(previewContent);
    iframeDocument.close();
  }
  
  // Modal handlers
  openModal() {
    this.modal.style.display = 'block';
    this.fileNameInput.value = '';
    this.fileNameInput.focus();
    
    // Reset file type to HTML
    this.fileTypeButtons.forEach(btn => btn.classList.remove('active'));
    this.fileTypeButtons[0].classList.add('active');
    this.activeFileType = 'html';
  }
  
  closeModalHandler() {
    this.modal.style.display = 'none';
  }
  
  createNewFile() {
    const fileName = this.fileNameInput.value.trim();
    
    if (!fileName) {
      alert('Please enter a file name');
      return;
    }
    
    // Add extension if not provided
    let finalFileName = fileName;
    if (!fileName.includes('.')) {
      switch (this.activeFileType) {
        case 'html':
          finalFileName += '.html';
          break;
        case 'css':
          finalFileName += '.css';
          break;
        case 'js':
          finalFileName += '.js';
          break;
      }
    }
    
    // Add the file
    this.addFile(finalFileName, this.activeFileType);
    
    // Close modal
    this.closeModalHandler();
  }
  
  // Toggle functions
  togglePreview() {
    this.isPreviewVisible = !this.isPreviewVisible;
    
    if (this.isPreviewVisible) {
      this.previewContainer.style.display = 'flex';
      this.togglePreviewBtn.innerHTML = '<i class="fas fa-eye-slash"></i><span>Hide Preview</span>';
      // Adjust editor width
      this.updateLayout();
      this.updatePreview();
    } else {
      this.previewContainer.style.display = 'none';
      this.togglePreviewBtn.innerHTML = '<i class="fas fa-eye"></i><span>Show Preview</span>';
      // Make editor full width
      this.updateLayout();
    }
  }
  
  updateLayout() {
    if (this.isPreviewVisible) {
      document.getElementById('editor-container').style.width = '50%';
    } else {
      document.getElementById('editor-container').style.width = '100%';
    }
  }
  
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    
    if (this.isDarkTheme) {
      document.body.classList.remove('light-theme');
      this.toggleThemeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.body.classList.add('light-theme');
      this.toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  // Context menu
  showContextMenu(event, fileId) {
    this.rightClickedFileId = fileId;
    
    const { clientX, clientY } = event;
    this.contextMenu.style.display = 'block';
    
    // Position the context menu
    const menuWidth = this.contextMenu.offsetWidth;
    const menuHeight = this.contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (clientX + menuWidth > windowWidth) {
      this.contextMenu.style.left = (clientX - menuWidth) + 'px';
    } else {
      this.contextMenu.style.left = clientX + 'px';
    }
    
    if (clientY + menuHeight > windowHeight) {
      this.contextMenu.style.top = (clientY - menuHeight) + 'px';
    } else {
      this.contextMenu.style.top = clientY + 'px';
    }
    
    event.stopPropagation();
  }
  
  hideContextMenu() {
    this.contextMenu.style.display = 'none';
  }
  
  // Rename handlers
  startRenameFile() {
    if (!this.rightClickedFileId) return;
    
    const file = this.files.find(file => file.id === this.rightClickedFileId);
    if (!file) return;
    
    // Find the file item element
    const fileItem = this.fileList.querySelector(`[data-id="${this.rightClickedFileId}"]`);
    if (!fileItem) return;
    
    const fileNameElement = fileItem.querySelector('.file-name');
    const rect = fileNameElement.getBoundingClientRect();
    
    // Position the rename overlay
    this.renameOverlay.style.display = 'flex';
    this.renameOverlay.style.top = rect.top + 'px';
    this.renameOverlay.style.left = rect.left + 'px';
    this.renameOverlay.style.width = (rect.width + 30) + 'px';
    
    // Set input value and focus
    this.renameInput.value = file.name;
    this.renameInput.focus();
    this.renameInput.select();
    
    this.hideContextMenu();
  }
  
  finishRenameFile() {
    if (!this.rightClickedFileId || !this.renameInput.value.trim()) {
      this.hideRenameOverlay();
      return;
    }
    
    // Ensure we retain the extension if the user removes it
    const file = this.files.find(file => file.id === this.rightClickedFileId);
    let newName = this.renameInput.value.trim();
    
    // If extension was removed, add it back
    if (file && !newName.includes('.')) {
      const oldExtension = file.name.split('.').pop();
      if (oldExtension) {
        newName += '.' + oldExtension;
      }
    }
    
    this.renameFile(this.rightClickedFileId, newName);
    this.hideRenameOverlay();
    this.showToast(`Renamed to ${newName}`);
  }
  
  hideRenameOverlay() {
    this.renameOverlay.style.display = 'none';
  }
  
  // Storage operations
  saveToLocalStorage() {
    const projectData = {
      files: this.files,
      activeFileId: this.activeFileId,
      isPreviewVisible: this.isPreviewVisible
    };
    
    localStorage.setItem('vg-code-project', JSON.stringify(projectData));
    
    // Show feedback
    this.showToast('Project saved to cache');
  }
  
  loadFromLocalStorage() {
    const savedProject = localStorage.getItem('vg-code-project');
    
    if (savedProject) {
      try {
        const projectData = JSON.parse(savedProject);
        this.files = projectData.files;
        this.activeFileId = projectData.activeFileId;
        this.isPreviewVisible = projectData.isPreviewVisible !== undefined ? projectData.isPreviewVisible : true;
        
        // Apply the preview visibility state
        if (!this.isPreviewVisible) {
          this.previewContainer.style.display = 'none';
          this.togglePreviewBtn.innerHTML = '<i class="fas fa-eye"></i><span>Show Preview</span>';
          document.getElementById('editor-container').style.width = '100%';
        }
        
        // Show feedback
        this.showToast('Project loaded from cache');
      } catch (error) {
        console.error('Error loading project:', error);
        this.files = [...this.defaultFiles];
        this.activeFileId = this.files.length > 0 ? this.files[0].id : null;
      }
    } else {
      this.files = [...this.defaultFiles];
      this.activeFileId = this.files.length > 0 ? this.files[0].id : null;
    }
  }
  
  // Import/Export
  exportFiles() {
    this.files.forEach(file => {
      this.downloadFile(file.name, file.content);
    });
    
    this.showToast('Files downloaded successfully');
  }
  
  downloadFile(filename, content) {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  async importFiles(fileList) {
    if (!fileList || fileList.length === 0) {
      this.showToast('No files selected', 'error');
      return;
    }
    
    const validExtensions = ['.html', '.htm', '.css', '.js'];
    const importedFiles = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileName = file.name;
      
      // Check if valid extension
      const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
      if (!isValidFile) {
        this.showToast(`Skipping ${fileName}: Unsupported file type`, 'error');
        continue;
      }
      
      // Get language
      let language = null;
      if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        language = 'html';
      } else if (fileName.endsWith('.css')) {
        language = 'css';
      } else if (fileName.endsWith('.js')) {
        language = 'js';
      }
      
      if (!language) {
        this.showToast(`Skipping ${fileName}: Unsupported file type`, 'error');
        continue;
      }
      
      try {
        // Read file
        const content = await this.readFile(file);
        importedFiles.push(new FileData(`${language}-${Date.now()}-${i}`, fileName, language, content));
      } catch (error) {
        console.error('Error reading file:', error);
        this.showToast(`Error importing ${fileName}`, 'error');
      }
    }
    
    if (importedFiles.length > 0) {
      this.files = importedFiles;
      this.activeFileId = importedFiles[0].id;
      this.renderFileList();
      this.updateEditorTabs();
      this.setActiveFile(this.activeFileId);
      this.saveToLocalStorage();
      this.showToast('Files imported successfully');
    } else {
      this.showToast('No valid files were imported', 'error');
    }
  }
  
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
  
  // Helper methods
  getTemplateForLanguage(language, filename) {
    switch (language) {
      case 'html':
        return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${filename}</title>\n</head>\n<body>\n  \n</body>\n</html>`;
      case 'css':
        return `/* ${filename} */\n\n/* Add your styles here */\n`;
      case 'js':
        return `// ${filename}\n\n// Add your code here\n`;
      default:
        return '';
    }
  }
  
  showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after timeout
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  async clearCache() {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear application cache if supported
      if (window.caches) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
      
      // Visual feedback
      const button = document.getElementById('clear-cache-btn');
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i><span>Cleared!</span>';
      
      setTimeout(() => {
        button.innerHTML = originalContent;
      }, 2000);
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache');
    }
  }
  
  toggleFullscreen() {
    const isFullscreen = this.previewContainer.classList.toggle('fullscreen');
    
    // Update the button icon
    const icon = this.fullscreenBtn.querySelector('i');
    if (isFullscreen) {
      icon.classList.remove('fa-expand');
      icon.classList.add('fa-compress');
    } else {
      icon.classList.remove('fa-compress');
      icon.classList.add('fa-expand');
    }
  }
}

// Create toast styles
const style = document.createElement('style');
style.textContent = `
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .toast-success {
    background-color: #10b981;
  }
  
  .toast-error {
    background-color: #ef4444;
  }
`;
document.head.appendChild(style);

// Initialize the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CodeEditor();
});
