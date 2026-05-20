import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../projects/flexible-date-picker/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  staticDirs: ['../projects/playground/public'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
};

export default config;
