import type { Meta, StoryObj } from '@storybook/angular';
import { FlexMonthPickerComponent } from '../month-picker/flex-month-picker.component';

const meta: Meta<FlexMonthPickerComponent> = {
  title: 'Pickers/MonthPicker',
  component: FlexMonthPickerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FlexMonthPickerComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Select month',
  },
};
