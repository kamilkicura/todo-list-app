import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '../../utils/my-date-formats';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AddDialogData } from '../../../models/add-dialog-data';
import { CamelToTitleCasePipe } from "../../pipes/camel-to-title-case-pipe/camel-to-title-case.pipe";

@Component({
  selector: 'app-add-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDatepickerModule, CommonModule, CamelToTitleCasePipe],
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class AddDialogComponent<T> implements OnInit {

  readonly dialogRef = inject(MatDialogRef<AddDialogComponent<T>>);
  readonly data = inject<AddDialogData<T>>(MAT_DIALOG_DATA);
  
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);

  protected dialogForm: FormGroup = new FormGroup({});
  protected dateControl = new FormControl<Date | null>(null, [Validators.required]);
  protected timeControl = new FormControl<string | null>(null, [
    Validators.required,
    Validators.pattern('^([01]\\d|2[0-3]):([0-5]\\d)$')
  ]);

  public ngOnInit(): void {
    this.setupForm();
    this.watchDateTimeChanges();
  }

  private setupForm(): void {
    const formGroup: { [key: string]: FormControl<any> } = {};

    this.data.controls.forEach(controlName => {
      let validators = [Validators.required];

      if (controlName === 'title' || controlName === 'text') {
        validators.push(Validators.minLength(3));
        validators.push(Validators.maxLength(controlName === 'title' ? 20 : 250));
        formGroup[controlName as string] = new FormControl<string>('', { validators });
        
      } else if (controlName === 'deadlineDate') {
        formGroup['date'] = this.dateControl;
        formGroup['time'] = this.timeControl;
        formGroup['deadlineDate'] = new FormControl<Date | null>(null, { validators });
      }
    });

    this.dialogForm = this.fb.group(formGroup);
    this.cd.markForCheck();

  }

  private watchDateTimeChanges(): void {
    this.dateControl.valueChanges.subscribe(() => this.updateDeadlineDate());
    this.timeControl.valueChanges.subscribe(() => this.updateDeadlineDate());
  }

  private updateDeadlineDate(): void {
    const dateValue = this.dateControl.value;
    const timeValue = this.timeControl.value;

    if (dateValue && timeValue) {
      const dateTime = new Date(dateValue);
      const [hours, minutes] = timeValue.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      this.dialogForm.get('deadlineDate')?.setValue(dateTime);
    }
  }

  protected onClick(value?: string): void {
    if (value === 'exit') {
      this.dialogRef.close();
    } else {
      let result = this.dialogForm.value;
      if (this.dialogForm.get('deadlineDate')?.value) {
        delete result.time;
        delete result.date;
      }
      this.dialogRef.close(this.dialogForm?.value);
    }
  }
}