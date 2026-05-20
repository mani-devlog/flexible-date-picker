import type { Meta, StoryObj } from '@storybook/angular';
import { FlexMonthRangePickerComponent } from '../month-range-picker/flex-month-range-picker.component';

const meta: Meta<FlexMonthRangePickerComponent> = {
  title: 'Pickers/MonthRangePicker',
  component: FlexMonthRangePickerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FlexMonthRangePickerComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Select month range',
  },
};
