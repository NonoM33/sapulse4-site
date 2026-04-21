"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Heading } from "@tiptap/extension-heading";
import { FontSize } from "@tiptap/extension-font-size";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import { SlashCommand } from "./editor/slash-command";
import { NowrapAttribute } from "./editor/nowrap-attribute";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const FONT_SIZES = [
  { label: "Auto", value: "" },
  { label: "XS", value: "0.75rem" },
  { label: "S", value: "0.875rem" },
  { label: "M", value: "1rem" },
  { label: "L", value: "1.25rem" },
  { label: "XL", value: "1.5rem" },
  { label: "2XL", value: "2rem" },
  { label: "3XL", value: "2.5rem" },
  { label: "4XL", value: "3rem" },
  { label: "5XL", value: "4rem" },
];

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  label: string;
  contentKey: string;
}

function ToolbarButton({
  onClick,
  active = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-xs font-bold transition-all ${
        active
          ? "bg-[#c2185b] text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ content, onChange, label, contentKey }: RichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Titre…";
          return "Écrivez quelque chose… ou tapez / pour les commandes";
        },
      }),
      NowrapAttribute,
      SlashCommand,
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[60px] px-4 py-3",
      },
    },
  });

  // Sync content when prop changes externally (e.g. cancel)
  const syncContent = useCallback(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useEffect(() => {
    syncContent();
  }, [syncContent]);

  if (!editor) return null;

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">{label}</span>
        <span className="text-xs text-gray-400 font-mono">{contentKey}</span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-t-lg border-b-0">
        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique"
        >
          <em>I</em>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph") && !editor.isActive("heading")}
          title="Paragraphe"
        >
          P
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Titre 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Titre 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Titre 3"
        >
          H3
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Font size */}
        <select
          value={editor.getAttributes("textStyle").fontSize ?? ""}
          onChange={(e) => {
            const size = e.target.value;
            if (size) {
              editor.chain().focus().setFontSize(size).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
          className="text-xs font-medium text-gray-600 border border-transparent rounded px-1.5 py-0.5 hover:bg-gray-100 focus:outline-none focus:border-gray-200 cursor-pointer"
          title="Taille du texte (sur la sélection)"
        >
          {FONT_SIZES.map((size) => (
            <option key={size.label} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Colors */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setColor("#c2185b").run()}
          title="Rose BK"
        >
          <span className="text-[#c2185b]">A</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setColor("#ea580c").run()}
          title="Orange BK"
        >
          <span className="text-[#ea580c]">A</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetColor().run()}
          title="Couleur par défaut"
        >
          <span className="text-gray-900">A</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Line break helpers */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHardBreak().run()}
          title="Retour à la ligne (Maj+Entrée) — sans créer de nouveau paragraphe"
        >
          ↵
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const type = editor.isActive("heading") ? "heading" : "paragraph";
            const current = editor.getAttributes(type).nowrap;
            editor
              .chain()
              .focus()
              .updateAttributes(type, { nowrap: current ? null : true })
              .run();
          }}
          active={
            Boolean(editor.getAttributes("paragraph").nowrap) ||
            Boolean(editor.getAttributes("heading").nowrap)
          }
          title="Forcer une seule ligne (tronque avec … si trop long)"
        >
          1L
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Highlight / Gradient marker */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight({ color: "gradient" }).run()}
          active={editor.isActive("highlight", { color: "gradient" })}
          title="Dégradé rose→orange (texte mis en valeur)"
        >
          <span className="bg-gradient-to-r from-[#c2185b] to-[#ea580c] bg-clip-text text-transparent font-extrabold">
            Dégradé
          </span>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Aligner à gauche"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Centrer"
        >
          ≡
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          • Liste
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
          ↪
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="border border-gray-200 rounded-b-lg bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
