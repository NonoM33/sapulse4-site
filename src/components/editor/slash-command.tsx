"use client";

import { Extension, type Editor, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import type { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import tippy, { type Instance, type Props as TippyProps } from "tippy.js";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface SlashItem {
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  command: (ctx: { editor: Editor; range: Range }) => void;
}

const items: SlashItem[] = [
  {
    title: "Titre 1",
    description: "Grand titre de section",
    icon: "H₁",
    keywords: ["title", "titre", "h1", "heading"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Titre 2",
    description: "Titre intermédiaire",
    icon: "H₂",
    keywords: ["title", "titre", "h2", "heading"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Titre 3",
    description: "Petit titre",
    icon: "H₃",
    keywords: ["title", "titre", "h3", "heading"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Texte",
    description: "Paragraphe simple",
    icon: "¶",
    keywords: ["text", "texte", "paragraph", "paragraphe"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("paragraph").run();
    },
  },
  {
    title: "Liste à puces",
    description: "Liste non ordonnée",
    icon: "•",
    keywords: ["list", "liste", "bullet", "puces"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Liste numérotée",
    description: "Liste ordonnée",
    icon: "1.",
    keywords: ["list", "liste", "numbered", "numérotée", "ordered"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Citation",
    description: "Bloc de citation",
    icon: "❝",
    keywords: ["quote", "citation", "blockquote"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Séparateur",
    description: "Ligne horizontale",
    icon: "━",
    keywords: ["hr", "divider", "separator", "separateur"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Code",
    description: "Bloc de code",
    icon: "{ }",
    keywords: ["code", "snippet"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
];

function filterItems(query: string): SlashItem[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
  );
}

interface SlashMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

interface SlashMenuRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(function SlashMenu(
  { items, command },
  ref
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-3 text-sm text-gray-400 w-80">
        Aucune commande
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden w-80 max-h-80 overflow-y-auto">
      <div className="px-3 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
        Blocs
      </div>
      <ul className="p-1">
        {items.map((item, idx) => (
          <li key={item.title}>
            <button
              type="button"
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => command(item)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition ${
                idx === selectedIndex
                  ? "bg-rose-50 text-[#c2185b]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-bold shrink-0 ${
                  idx === selectedIndex
                    ? "border-[#c2185b] text-[#c2185b] bg-white"
                    : "border-gray-200 text-gray-500 bg-white"
                }`}
              >
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{item.title}</div>
                <div className="text-xs text-gray-400 truncate">{item.description}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: { command: (ctx: { editor: Editor; range: Range }) => void };
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }) => filterItems(query),
        render: () => {
          let component: ReactRenderer<SlashMenuRef> | null = null;
          let popup: Instance<TippyProps> | null = null;

          return {
            onStart: (props: SuggestionProps<SlashItem, { command: SlashItem["command"] }>) => {
              component = new ReactRenderer(SlashMenu, {
                props: {
                  items: props.items as unknown as SlashItem[],
                  command: (item: SlashItem) => props.command({ command: item.command } as unknown as { command: SlashItem["command"] }),
                },
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy(document.body, {
                getReferenceClientRect: () =>
                  (props.clientRect?.() as DOMRect | null) ?? new DOMRect(),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                theme: "light",
                offset: [0, 6],
              });
            },
            onUpdate: (props: SuggestionProps<SlashItem, { command: SlashItem["command"] }>) => {
              component?.updateProps({
                items: props.items as unknown as SlashItem[],
                command: (item: SlashItem) =>
                  props.command({ command: item.command } as unknown as { command: SlashItem["command"] }),
              });

              if (!props.clientRect || !popup) return;
              popup.setProps({
                getReferenceClientRect: () =>
                  (props.clientRect?.() as DOMRect | null) ?? new DOMRect(),
              });
            },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") {
                popup?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              popup?.destroy();
              component?.destroy();
              popup = null;
              component = null;
            },
          };
        },
      }),
    ];
  },
});
