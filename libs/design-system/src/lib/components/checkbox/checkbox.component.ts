import { Component, input, signal, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ds-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent implements ControlValueAccessor {
  label = input<string>('');

  value = signal(false);
  isDisabled = signal(false);

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  toggle() {
    if (this.isDisabled()) return;
    const newVal = !this.value();
    this.value.set(newVal);
    this.onChange(newVal);
    this.onTouched();
  }

  writeValue(value: boolean): void { this.value.set(!!value); }
  registerOnChange(fn: (value: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
