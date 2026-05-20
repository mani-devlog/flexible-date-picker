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
  args: { placeholder: 'Select date' },
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    (story) => ({
      template: `<div class="dark" data-flex-theme="dark">${story().template ?? '<fdp-date-picker placeholder="Select date" />'}</div>`,
    }),
  ],
};
