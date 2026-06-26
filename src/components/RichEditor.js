import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full border border-slate-200 rounded-xl bg-slate-50 animate-pulse"
      style={{ minHeight: 160 }}
    />
  ),
});

const BUTTONS = {
  full: [
    "bold", "italic", "underline", "strikethrough", "|",
    "ul", "ol", "|",
    "h1", "h2", "h3", "|",
    "link", "|",
    "left", "center", "right", "|",
    "undo", "redo", "|",
    "source",
  ],
  standard: [
    "bold", "italic", "underline", "|",
    "ul", "ol", "|",
    "link", "|",
    "left", "center", "|",
    "undo", "redo",
  ],
  minimal: ["bold", "italic", "|", "ul", "ol", "|", "undo", "redo"],
};

export default function RichEditor({
  value,
  onChange,
  height = 200,
  toolbar = "standard",
  placeholder = "Enter content here…",
}) {
  const editorRef = useRef(null);
  const [local, setLocal] = useState(value || "");

  // Sync when parent value changes (initial data load / tab switch)
  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      height,
      minHeight: height,
      toolbarAdaptive: false,
      toolbarSticky: false,
      spellcheck: true,
      language: "en",
      toolbarButtonSize: "small",
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_as_html",
      buttons: BUTTONS[toolbar] || BUTTONS.standard,
      removeButtons: [
        "fullsize", "about", "outdentList", "indentList",
        "fontsize", "font", "brush", "paragraph",
        "video", "table", "image", "file", "hr", "print",
      ],
      disablePlugins: [
        "add-new-line", "drag-and-drop-element",
        "media", "stat", "video", "table", "search",
      ],
      style: {
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "14px",
        color: "#1e293b",
        background: "#ffffff",
        lineHeight: "1.7",
        padding: "4px 4px",
      },
      uploader: { insertImageAsBase64URI: false },
      filebrowser: { disabled: true },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toolbar, height, placeholder]
  );

  return (
    <div className="jodit-admin-wrap">
      <JoditEditor
        ref={editorRef}
        value={local}
        config={config}
        tabIndex={1}
        onChange={(c) => setLocal(c)}
        onBlur={(c) => {
          setLocal(c);
          onChange?.(c);
        }}
      />
    </div>
  );
}
