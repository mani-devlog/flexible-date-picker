import type { Meta, StoryObj } from '@storybook/angular';
import { FlexYearRangePickerComponent } from '../year-range-picker/flex-year-range-picker.component';

const meta: Meta<FlexYearRangePickerComponent> = {
  title: 'Pickers/YearRangePicker',
  component: FlexYearRangePickerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FlexYearRangePickerComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Select year range',
  },
};
