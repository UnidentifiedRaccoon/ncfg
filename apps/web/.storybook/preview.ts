import type { Preview } from "@storybook/nextjs-vite";

import "../app/globals.css";

const preview = {
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
    options: {
      storySort: {
        order: [
          "Design System",
          ["Overview", "Colors", "Typography", "Spacing", "Radii & Shadows"],
          "Components",
          ["Button"],
          "Layout",
          ["Container", "Section"],
          "Content",
          ["MarkdownContent"],
        ],
      },
    },
  },
} satisfies Preview;

export default preview;
