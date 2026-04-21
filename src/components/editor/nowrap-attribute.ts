import { Extension } from "@tiptap/core";

interface NowrapAttrs {
  nowrap?: boolean | null;
}

/**
 * Adds a boolean `nowrap` attribute to paragraph and heading nodes.
 * Serializes to `data-nowrap="true"` so the frontend CSS can force a single
 * line with ellipsis truncation.
 */
export const NowrapAttribute = Extension.create({
  name: "nowrapAttribute",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          nowrap: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute("data-nowrap") ? true : null,
            renderHTML: (attributes: NowrapAttrs) =>
              attributes.nowrap ? { "data-nowrap": "true" } : {},
          },
        },
      },
    ];
  },
});
