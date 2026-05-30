"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, List, ListOrdered } from "lucide-react";

function ToolBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-slate-200 text-slate-900"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

export default function TipTapEditor({
  label,
  value,
  onChange,
  placeholder = "Write a description…",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-[160px] p-3 outline-none text-sm text-slate-800",
      },
    },
    onBlur: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <p className="text-sm font-medium text-slate-600">{label}</p>
      )}
      <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-sm focus-within:ring-1 focus-within:ring-slate-400">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
          <ToolBtn
            active={editor.isActive("bold")}
            title="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={15} />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("bulletList")}
            title="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={15} />
          </ToolBtn>
          <ToolBtn
            active={editor.isActive("orderedList")}
            title="Numbered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} />
          </ToolBtn>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
