import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { OnChange } from "@monaco-editor/react";

interface EditorProps {
  language?: string;
  value: string;
  onChange: OnChange;
  [key: string]: any;
}

export default function Monaco({
  language = "javascript",
  value,
  onChange,
  ...props
}: EditorProps) {
  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("custom-light", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#262626",
      },
    });
    monaco.editor.setTheme("custom-light");
  };

  return (
    <MonacoEditor
      height="88%"
      language={language}
      value={value}
      onChange={onChange}
      theme="custom-light"
      onMount={handleMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        glyphMargin: false, // Hides the margin before line numbers
        scrollbar: {
          vertical: "hidden", // Hides the vertical scrollbar
          horizontal: "hidden", // Hides the horizontal scrollbar
          handleMouseWheel: true, // Still allow scrolling
          alwaysConsumeMouseWheel: false,
        },
        lineNumbers: "on",
        overviewRulerLanes: 0, // Hides the right overview ruler
        overviewRulerBorder: false,
        renderLineHighlight: "none", // Removes line highlight
        padding: { top: 9, bottom: 0 },
        
      }}
      {...props}
    />
  );
}
