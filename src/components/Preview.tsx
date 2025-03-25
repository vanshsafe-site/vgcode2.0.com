
import React, { useEffect, useRef } from 'react';
import { useEditor } from '../context/EditorContext';
import { generatePreview } from '@/utils/fileUtils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Preview: React.FC = () => {
  const { files, previewVisible } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Update preview when files change
  useEffect(() => {
    updatePreview();
  }, [files]);
  
  const updatePreview = () => {
    if (iframeRef.current) {
      const previewContent = generatePreview(files);
      
      // Access the iframe document and write the content
      const iframeDocument = iframeRef.current.contentDocument || 
                            (iframeRef.current.contentWindow?.document);
      
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(previewContent);
        iframeDocument.close();
      }
    }
  };
  
  if (!previewVisible) return null;
  
  return (
    <div className="relative h-full flex flex-col border-l border-editor-border animate-slide-in">
      <div className="flex items-center justify-between p-2 bg-editor-bg border-b border-editor-border">
        <h2 className="text-sm font-medium text-editor-text">Live Preview</h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={updatePreview}
          className="h-6 w-6 text-editor-text hover:text-editor-accent hover:bg-editor-accent/10"
          title="Refresh Preview"
        >
          <RefreshCw size={14} />
        </Button>
      </div>
      <div className="flex-1 bg-white overflow-hidden">
        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default Preview;
