
import { FileData } from '../context/EditorContext';
import { toast } from 'sonner';

// Generate HTML preview combining HTML, CSS and JS files
export const generatePreview = (files: FileData[]): string => {
  const htmlFile = files.find(file => file.language === 'html');
  const cssFiles = files.filter(file => file.language === 'css');
  const jsFiles = files.filter(file => file.language === 'js');

  if (!htmlFile) {
    return `<html><body><h1>No HTML file found</h1><p>Create an HTML file to see the preview.</p></body></html>`;
  }

  // Simple parsing to inject CSS and JS
  let htmlContent = htmlFile.content;

  // Replace closing head tag with CSS style tags
  if (cssFiles.length > 0) {
    const cssContent = cssFiles.map(file => 
      `<style data-file="${file.name}">\n${file.content}\n</style>`
    ).join('\n');

    htmlContent = htmlContent.replace(
      '</head>',
      `${cssContent}\n</head>`
    );
  }

  // Replace closing body tag with script tags
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
};

// Read an imported file
export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Parse file extension to determine language
export const getLanguageFromFilename = (filename: string): 'html' | 'css' | 'js' | null => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'javascript':
      return 'js';
    default:
      return null;
  }
};

// Import files from user's device
export const importFiles = async (
  fileList: FileList | null, 
  callback: (files: FileData[]) => void
): Promise<void> => {
  if (!fileList || fileList.length === 0) {
    toast.error('No files selected');
    return;
  }
  
  const importedFiles: FileData[] = [];
  const validExtensions = ['.html', '.htm', '.css', '.js'];
  
  try {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileName = file.name;
      
      // Check if the file has a valid extension
      const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidFile) {
        toast.error(`Skipping ${fileName}: Unsupported file type`);
        continue;
      }
      
      const language = getLanguageFromFilename(fileName);
      
      if (!language) {
        toast.error(`Skipping ${fileName}: Unsupported file type`);
        continue;
      }
      
      const content = await readFile(file);
      
      importedFiles.push({
        id: `${language}-${Date.now()}-${i}`,
        name: fileName,
        language,
        content
      });
    }
    
    if (importedFiles.length > 0) {
      callback(importedFiles);
    } else {
      toast.error('No valid files were imported');
    }
  } catch (error) {
    console.error('Import error:', error);
    toast.error('Failed to import files');
  }
};
