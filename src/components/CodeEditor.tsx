import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileData } from '@/context/EditorContext';
import { cn } from '@/lib/utils';
import { File, FileText, FileCode } from 'lucide-react';

const CodeEditor: React.FC = () => {
  const { files, activeFileId, updateFile, setActiveFile } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState(activeFileId || '');

  useEffect(() => {
    if (activeFileId) {
      setActiveTab(activeFileId);
    }
  }, [activeFileId]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setActiveFile(value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    if (activeFileId) {
      updateFile(activeFileId, value);
    }
  };

  const getFileIcon = (language: string) => {
    switch (language) {
      case 'html':
        return <FileText size={14} className="text-orange-400" />;
      case 'css':
        return <File size={14} className="text-blue-400" />;
      case 'js':
        return <FileCode size={14} className="text-yellow-400" />;
      default:
        return <File size={14} />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      e.currentTarget.value = value.substring(0, start) + '  ' + value.substring(end);
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
      
      if (activeFileId) {
        updateFile(activeFileId, e.currentTarget.value);
      }
    }
  };

  const activeFile = files.find(file => file.id === activeFileId);

  return (
    <div className="flex flex-col h-full animate-scale-in">
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="h-full flex flex-col"
      >
        <div className="border-b border-editor-border overflow-x-auto">
          <TabsList className="bg-editor-bg h-10 p-0">
            {files.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className={cn(
                  "editor-tab relative",
                  activeTab === file.id && "active"
                )}
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.language)}
                  <span>{file.name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {files.map((file) => (
            <TabsContent
              key={file.id}
              value={file.id}
              className="h-full overflow-hidden m-0 data-[state=active]:animate-fade-in"
            >
              <textarea
                ref={textareaRef}
                value={file.content}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                className="code-editor"
                spellCheck="false"
                data-language={file.language}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default CodeEditor;
