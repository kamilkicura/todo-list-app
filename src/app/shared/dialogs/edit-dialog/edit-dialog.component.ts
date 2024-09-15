import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { EditDialogData } from '../../../models/edit-dialog-data';
import { CamelToTitleCasePipe } from '../../pipes/camel-to-title-case-pipe/camel-to-title-case.pipe';
import { BaseComponent } from '../../components/base/base.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatDatepickerModule, CommonModule, CamelToTitleCasePipe],
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class EditDialogComponent<T> extends BaseComponent implements OnInit, OnDestroy {

  readonly dialogRef = inject(MatDialogRef<EditDialogComponent<T>>);
  readonly data = inject<EditDialogData<T>>(MAT_DIALOG_DATA);
  
  private fb = inject(FormBuilder);
  private cd = inject(ChangeDetectorRef);
  
  protected dialogForm: FormGroup = new FormGroup({});
  protected initialValuesInForm: Partial<T> | null = this.data.item ? this.data.item : null;
  protected enabledSendButton: boolean = false;
  protected dateControl = new FormControl<string | null>(null, [Validators.required]);
  protected timeControl = new FormControl<string | null>(null, [
    Validators.required,
    Validators.pattern('^([01]\\d|2[0-3]):([0-5]\\d)$')
  ]);

  public ngOnInit(): void {
    this.setupForm();
  }

  private setupForm(): void {
    if(this.data.item) {
      let formGroup: { [key: string]: FormControl<any> } = {};

    this.data.controls.forEach(controlName => {
      let value = this.data.item[controlName];
      let validators = [Validators.required];

      if (typeof value === 'string') {
        validators.push(Validators.minLength(3));
        validators.push(Validators.maxLength(controlName === 'title' ? 20 : 250));
        formGroup[controlName as string] = new FormControl<string>(value, { validators });

      } else if (value instanceof Date) {
        formGroup[controlName as string] = new FormControl<Date>(value, { nonNullable: true, validators });

        this.setDateTimeControls(value);

      } else {
        formGroup[controlName as string] = new FormControl<any>(value ?? '', { validators });
      }
    });

    this.dialogForm = this.fb.group({
      ...formGroup,
      dateControl: this.dateControl,
      timeControl: this.timeControl,
    });

    this.initialValuesInForm = this.dialogForm.value;
    this.canSendData();
    }
  }

  private setDateTimeControls(date: Date): void {
    const formattedDate = date.toISOString().split('T')[0];
    const timeValue = date.toTimeString().substring(0, 5);
    this.dateControl.setValue(formattedDate);
    this.timeControl.setValue(timeValue === '00:00' ? '00:00' : timeValue);
  }

  protected isFormDisabled(): void {
    this.enabledSendButton = this.dialogForm.valid && (JSON.stringify(this.initialValuesInForm) !== JSON.stringify(this.dialogForm.value));
    this.cd.markForCheck();
  }

  protected canSendData(): void {
    this.dialogForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe( () => {
      this.isFormDisabled();
    })
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
      this.updateDeadlineDate();
      let result = this.dialogForm.value;
      if (this.dialogForm.get('deadlineDate')?.value) {
        delete result.timeControl;
        delete result.dateControl;
      }
      this.dialogRef.close(this.dialogForm?.value);
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

}