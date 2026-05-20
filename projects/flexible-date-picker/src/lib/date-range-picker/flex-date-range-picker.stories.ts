import type { Meta, StoryObj } from '@storybook/angular';
import { subDays } from 'date-fns';
import { FlexDateRangePickerComponent } from '../date-range-picker/flex-date-range-picker.component';
import type { PresetRange } from '../models';
import { normalizeDate } from '../utils/normalize-date';

const meta: Meta<FlexDateRangePickerComponent> = {
  title: 'Pickers/DateRangePicker',
  component: FlexDateRangePickerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FlexDateRangePickerComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Select date range',
  },
};

export const WithoutPresetSidebar: Story = {
  args: {
    placeholder: 'Select date range',
    presetSidebar: { enabled: false },
  },
};

export const SingleCalendar: Story = {
  args: {
    placeholder: 'Select date range',
    calendarLayout: { mode: 'single' },
  },
};

export const DoubleCalendar: Story = {
  args: {
    placeholder: 'Select date range',
    calendarLayout: { mode: 'double' },
  },
};

export const CustomPresets: Story = {
  args: {
    placeholder: 'Select date range',
    presetSidebar: {
      presets: [
        {
          id: 'last14',
          label: 'Last 14 Days',
          getRange: (ref = new Date()) => ({
            start: normalizeDate(subDays(ref, 13), 'day'),
            end: normalizeDate(ref, 'day'),
          }),
        },
        {
          id: 'last90',
          label: 'Last 90 Days',
          getRange: (ref = new Date()) => ({
            start: normalizeDate(subDays(ref, 89), 'day'),
            end: normalizeDate(ref, 'day'),
          }),
        },
      ] satisfies PresetRange[],
    },
  },
};
