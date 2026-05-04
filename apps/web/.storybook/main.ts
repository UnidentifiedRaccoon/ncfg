import type { StorybookConfig } from "@storybook/nextjs-vite";

const config = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal(config) {
    return {
      ...config,
      publicDir: false,
    };
  },
} satisfies StorybookConfig;

export default config;
