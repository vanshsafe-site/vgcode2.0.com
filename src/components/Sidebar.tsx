
import React, { useState } from 'react';
import { useEditor, FileData } from '../context/EditorContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  File,
  FileCode,
  FileCss,
  FileText,
  MoreVertical,
  Edit,
  Trash,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FileIconProps = {
  language: string;
  className?: string;
};

const FileIcon: React.FC<FileIconProps> = ({ language, className }) => {
  switch (language) {
    case 'html':
      return <FileText size={16} className={cn('text-orange-400', className)} />;
    case 'css':
      return <FileCss size={16} className={cn('text-blue-400', className)} />;
    case 'js':
      return <FileCode size={16} className={cn('text-yellow-400', className)} />;
    default:
      return <File size={16} className={className} />;
  }
};

const Sidebar: React.FC = () => {
  const { files, activeFileId, setActiveFile, renameFile, deleteFile, sidebarVisible } = useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  if (!sidebarVisible) return null;

  const startRenaming = (file: FileData) => {
    setEditingId(file.id);
    setNewName(file.name);
  };

  const handleRename = (id: string) => {
    if (newName.trim()) {
      renameFile(id, newName);
    }
    setEditingId(null);
  };

  return (
    <div className="w-60 bg-editor-sidebar border-r border-editor-border flex flex-col h-full overflow-hidden transition-all duration-300 animate-slide-in">
      <div className="p-4 border-b border-editor-border">
        <h2 className="font-semibold text-editor-text">EXPLORER</h2>
      </div>
      <div className="p-2 flex-1 overflow-y-auto">
        <div className="mb-2 text-xs uppercase font-medium text-editor-text/50 px-2">Files</div>
        <ul className="space-y-1">
          {files.map((file) => (
            <li key={file.id} className="relative group">
              {editingId === file.id ? (
                <div className="flex items-center p-1.5 rounded-md bg-editor-accent/10">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    onBlur={() => handleRename(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(file.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="h-6 py-1 px-2 text-xs bg-editor-bg text-editor-text border-editor-border"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="h-6 w-6 ml-1 text-editor-text hover:text-editor-accent"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    'flex items-center justify-between p-1.5 rounded-md cursor-pointer hover:bg-editor-accent/10 transition-colors',
                    activeFileId === file.id && 'bg-editor-accent/10 text-editor-accent'
                  )}
                  onClick={() => setActiveFile(file.id)}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileIcon language={file.language} />
                    <span className="truncate text-editor-text">{file.name}</span>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-editor-text hover:text-editor-accent hover:bg-editor-accent/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={14} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-48 p-0 bg-editor-bg border-editor-border"
                      align="end"
                    >
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          className="justify-start font-normal text-editor-text hover:bg-editor-accent/10 hover:text-editor-accent flex items-center px-2 py-1.5"
                          onClick={() => startRenaming(file)}
                        >
                          <Edit size={14} className="mr-2" />
                          Rename
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start font-normal text-editor-text hover:bg-destructive/90 hover:text-white flex items-center px-2 py-1.5"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash size={14} className="mr-2" />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
