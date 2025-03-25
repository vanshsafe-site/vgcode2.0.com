
import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Upload, 
  Code, 
  FilePlus, 
  Eye, 
  EyeOff, 
  Menu, 
  X,
  Sun,
  Moon,
  Save
} from 'lucide-react';
import { importFiles } from '@/utils/fileUtils';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { 
    exportProject, 
    importProject, 
    addFile, 
    togglePreview, 
    toggleSidebar,
    previewVisible,
    files
  } = useEditor();
  
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'html' | 'css' | 'js'>('html');
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    importFiles(e.target.files, importProject);
    e.target.value = '';
  };
  
  const handleAddFile = () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }
    
    // Add extension if not provided
    let fileName = newFileName;
    if (!fileName.includes('.')) {
      switch (newFileType) {
        case 'html': fileName += '.html'; break;
        case 'css': fileName += '.css'; break;
        case 'js': fileName += '.js'; break;
      }
    }
    
    addFile(fileName, newFileType);
    setNewFileName('');
    setIsOpen(false);
  };
  
  const handleSaveToCache = () => {
    localStorage.setItem('code-editor-project', JSON.stringify({
      files,
      activeFileId: files.length > 0 ? files[0].id : null
    }));
    toast.success('Project saved to cache');
  };
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="p-2 bg-editor-bg border-b border-editor-border flex items-center justify-between transition-all duration-300 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="text-editor-text hover:text-editor-accent hover:bg-editor-accent/10 transition-colors"
        >
          <Menu size={18} />
        </Button>
        <div className="flex items-center">
          <Code size={20} className="text-editor-accent mr-2" />
          <h1 className="text-editor-text font-medium hidden md:block">VSCode-inspired Editor</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 md:space-x-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-editor-text hover:text-editor-accent hover:bg-editor-accent/10 transition-all"
            >
              <FilePlus size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">New File</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-editor-bg border-editor-border text-editor-text">
            <DialogHeader>
              <DialogTitle className="text-editor-text">Create New File</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-editor-text">File Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. index.html"
                  className="bg-editor-sidebar border-editor-border text-editor-text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-editor-text">File Type</Label>
                <div className="flex space-x-4">
                  {(['html', 'css', 'js'] as const).map(type => (
                    <Button
                      key={type}
                      type="button"
                      variant={newFileType === type ? "default" : "outline"}
                      onClick={() => setNewFileType(type)}
                      className={`${newFileType === type ? 'bg-editor-accent text-white' : 'bg-editor-sidebar text-editor-text border-editor-border'}`}
                    >
                      {type.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={handleAddFile}
                className="bg-editor-accent hover:bg-editor-accent/90 text-white transition-colors"
              >
                Create File
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          onClick={togglePreview}
          className="text-editor-text hover:text-editor-accent hover:bg-editor-accent/10 transition-all"
        >
          {previewVisible ? (
            <>
              <EyeOff size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Hide Preview</span>
            </>
          ) : (
            <>
              <Eye size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Show Preview</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveToCache}
          className="text-editor-text hover:text-editor-accent hover:bg-editor-accent/10 transition-all"
        >
          <Save size={16} className="mr-1 md:mr-2" />
          <span className="hidden md:inline">Save</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={exportProject}
          className="text-editor-text hover:text-editor-accent hover:bg-editor-accent/10 transition-all"
        >
          <Download size={16} className="mr-1 md:mr-2" />
          <span className="hidden md:inline">Export</span>
        </Button>

        <div className="relative">
          <Input
            type="file"
            multiple
            accept=".html,.htm,.css,.js"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-editor-text hover:text-editor-accent hover:bg-editor-accent/10 transition-all relative z-10 pointer-events-none"
          >
            <Upload size={16} className="mr-1 md:mr-2" />
            <span className="hidden md:inline">Import</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-editor-text hover:text-editor-accent hover:bg-editor-accent/10 transition-all"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  );
};

export default Header;
