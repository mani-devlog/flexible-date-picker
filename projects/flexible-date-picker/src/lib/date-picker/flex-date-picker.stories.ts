import type { Meta, StoryObj } from '@storybook/angular';
import { FlexDatePickerComponent } from '../date-picker/flex-date-picker.component';

const meta: Meta<FlexDatePickerComponent> = {
  title: 'Pickers/DatePicker',
  component: FlexDatePickerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FlexDatePickerComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Select date',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Select date',
  },
  render: (args) => ({
    props: { ...args, value: new Date(2024, 5, 15) },
    template: `<fdp-date-picker [placeholder]="placeholder" [ngModel]="value" />`,
  }),
};

export const WithoutIcon: Story = {
  args: {
    placeholder: 'Select date',
    showIcon: false,
  },
};

export const DarkMode: Story = {
  args: {
    placeholder: 'Select date',
    colorScheme: 'dark',
  },
  parameters: { backgrounds: { default: 'dark' } },
};

export const AutoColorScheme: Story = {
  args: {
    placeholder: 'Select date',
    colorScheme: 'auto',
  },
};

export const CustomColors: Story = {
  args: {
    placeholder: 'Select date',
    customColors: {
      primary: '#be123c',
      primaryForeground: '#ffffff',
      surface: '#fff1f2',
      surfaceElevated: '#ffe4e6',
      border: '#fecdd3',
      muted: '#fce7f3',
      mutedForeground: '#9f1239',
      accent: '#ffe4e6',
      accentForeground: '#be123c',
      range: '#fecdd3',
      today: '#fdf2f8',
      disabled: '#fda4af',
      radius: '0.5rem',
    },
  },
};
