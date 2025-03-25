
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface FileData {
  id: string;
  name: string;
  language: 'html' | 'css' | 'js';
  content: string;
}

interface EditorContextType {
  files: FileData[];
  activeFileId: string | null;
  previewVisible: boolean;
  sidebarVisible: boolean;
  addFile: (name: string, language: 'html' | 'css' | 'js', content?: string) => void;
  updateFile: (id: string, content: string) => void;
  renameFile: (id: string, newName: string) => void;
  deleteFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;
  exportProject: () => void;
  importProject: (files: FileData[]) => void;
}

const defaultFiles: FileData[] = [
  {
    id: 'html-1',
    name: 'index.html',
    language: 'html',
    content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>Start coding your amazing project!</p>\n  \n  <script src="script.js"></script>\n</body>\n</html>'
  },
  {
    id: 'css-1',
    name: 'styles.css',
    language: 'css',
    content: 'body {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  line-height: 1.6;\n  color: #333;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\nh1 {\n  color: #2563eb;\n}\n'
  },
  {
    id: 'js-1',
    name: 'script.js',
    language: 'js',
    content: '// Your JavaScript code goes here\nconsole.log("Hello from JavaScript!");\n\n// Example function\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Test the function\nconsole.log(greet("Coder"));\n'
  }
];

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Load files from localStorage on initial render
  useEffect(() => {
    const savedProject = localStorage.getItem('code-editor-project');
    
    if (savedProject) {
      try {
        const parsedProject = JSON.parse(savedProject);
        setFiles(parsedProject.files);
        setActiveFileId(parsedProject.activeFileId || (parsedProject.files.length > 0 ? parsedProject.files[0].id : null));
        toast.success('Project loaded from cache');
      } catch (error) {
        console.error('Error loading project from cache:', error);
        setFiles(defaultFiles);
        setActiveFileId(defaultFiles[0].id);
        toast.error('Failed to load project from cache');
      }
    } else {
      setFiles(defaultFiles);
      setActiveFileId(defaultFiles[0].id);
    }
  }, []);

  // Save to localStorage whenever files change
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem('code-editor-project', JSON.stringify({
        files,
        activeFileId
      }));
    }
  }, [files, activeFileId]);

  const addFile = (name: string, language: 'html' | 'css' | 'js', content: string = '') => {
    const newFile: FileData = {
      id: `${language}-${Date.now()}`,
      name,
      language,
      content: content || getTemplateForLanguage(language, name),
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    toast.success(`Created ${name}`);
  };

  const updateFile = (id: string, content: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, content } : file
    ));
  };

  const renameFile = (id: string, newName: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, name: newName } : file
    ));
    toast.success(`Renamed to ${newName}`);
  };

  const deleteFile = (id: string) => {
    const fileToDelete = files.find(file => file.id === id);
    
    setFiles(prev => prev.filter(file => file.id !== id));
    
    if (activeFileId === id) {
      setActiveFileId(files.length > 1 ? files.find(file => file.id !== id)?.id || null : null);
    }
    
    if (fileToDelete) {
      toast.success(`Deleted ${fileToDelete.name}`);
    }
  };

  const setActiveFile = (id: string | null) => {
    setActiveFileId(id);
  };

  const togglePreview = () => {
    setPreviewVisible(prev => !prev);
  };

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  const exportProject = () => {
    const htmlFile = files.find(file => file.language === 'html');
    const cssFile = files.find(file => file.language === 'css');
    const jsFile = files.find(file => file.language === 'js');

    if (htmlFile) {
      downloadFile(htmlFile.name, htmlFile.content);
    }
    
    if (cssFile) {
      downloadFile(cssFile.name, cssFile.content);
    }
    
    if (jsFile) {
      downloadFile(jsFile.name, jsFile.content);
    }
    
    // Create a zip file containing all files
    toast.success('Files downloaded successfully');
  };

  const importProject = (importedFiles: FileData[]) => {
    setFiles(importedFiles);
    if (importedFiles.length > 0) {
      setActiveFileId(importedFiles[0].id);
      toast.success('Project imported successfully');
    }
  };

  return (
    <EditorContext.Provider value={{
      files,
      activeFileId,
      previewVisible,
      sidebarVisible,
      addFile,
      updateFile,
      renameFile,
      deleteFile,
      setActiveFile,
      togglePreview,
      toggleSidebar,
      exportProject,
      importProject
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

// Helper functions
const getTemplateForLanguage = (language: string, filename: string): string => {
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
};

const downloadFile = (filename: string, content: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
