import type { Meta, StoryObj } from '@storybook/angular';
import { FlexYearPickerComponent } from '../year-picker/flex-year-picker.component';

const meta: Meta<FlexYearPickerComponent> = {
  title: 'Pickers/YearPicker',
  component: FlexYearPickerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FlexYearPickerComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Select year',
  },
};
