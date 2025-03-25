
import React, { useEffect } from 'react';
import { EditorProvider } from '@/context/EditorContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const isMobile = useIsMobile();

  // Set the theme to dark by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <EditorProvider>
      <div className="flex flex-col h-screen bg-editor-bg text-editor-text overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className={`flex flex-1 ${isMobile ? 'flex-col' : 'flex-row'} overflow-hidden`}>
            <div className={`${isMobile ? 'h-1/2' : 'w-1/2'} min-h-0 min-w-0`}>
              <CodeEditor />
            </div>
            <div className={`${isMobile ? 'h-1/2' : 'w-1/2'} min-h-0 min-w-0`}>
              <Preview />
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </EditorProvider>
  );
};

export default Index;
