"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function RichTextEditor({
  label = "Executive Summary",
  value,
  onChange,
  placeholder,
}) {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (value != null && value !== content) {
      setContent(value);
    }
  }, [value]);

  const editorConfig = {
    height: 250,
    readonly: false,
    toolbarAdaptive: false,
    toolbarSticky: false,
    spellcheck: true,

    buttons: ["bold", "ul", "ol"],

    removeButtons: [
      "source",
      "image",
      "video",
      "table",
      "link",
      "brush",
      "font",
      "fontsize",
      "paragraph",
      "fullsize",
    ],

    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_clear_html",
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      {label && <p className="text-gray-600 text-sm font-medium">{label}</p>}

      <div className="rounded-xl text-black overflow-hidden shadow-sm border border-gray-600 bg-gray-50">
        <JoditEditor
          ref={editor}
          value={content}
          config={{ ...editorConfig, placeholder }}
          tabIndex={1}
          onChange={(newContent) => {
            setContent(newContent); 
          }}
          onBlur={(newContent) => {
            onChange?.(newContent); 
          }}
        />
      </div>
    </div>
  );
}
