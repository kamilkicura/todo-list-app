import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Todo } from '../../../models/todo';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TodosService } from '../../../services/todos.service';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogData } from '../../../models/edit-dialog-data';
import { EditDialogComponent } from '../../dialogs/edit-dialog/edit-dialog.component';
import { SentenceCasePipe } from "../../pipes/sentense-case-pipe/sentence-case.pipe";
import { BaseComponent } from '../base/base.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCheckboxModule, MatButtonModule, ReactiveFormsModule, SentenceCasePipe],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoComponent extends BaseComponent implements OnInit, OnDestroy {

  @Input() todo!: Todo;
  @Output() isRemoved: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isEdited: EventEmitter<boolean> = new EventEmitter<boolean>();

  protected checkboxValue: FormControl<boolean | null> = new FormControl<boolean | null>(false);

  private todosService = inject(TodosService);
  private dialog = inject(MatDialog);
  private cd = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    if (this.todo) {
      this.checkboxValue = new FormControl<boolean | null>(this.todo.isActive ? false : true);
      this.listenToCheckBoxChanges();
    }
  }

  private listenToCheckBoxChanges(): void {
    this.checkboxValue.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((isChecked) => {
      let value: Partial<Todo> = { isActive: isChecked ? false : true };
      this.updatePartialTodo(this.todo, value);
      this.cd.markForCheck();
    });
  }

  protected editTodo(): void {
    this.todo.deadlineDate = new Date(this.todo.deadlineDate);
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: {
        item: this.todo,
        title:'Edit Todo',
        controls: ['title','text','deadlineDate']
      } as EditDialogData<Todo>
    });

    dialogRef.afterClosed().subscribe((result: Partial<Todo>) => {
      if (this.todo) { 
        this.updatePartialTodo(this.todo, result);
      }
    })

  }

  protected updatePartialTodo(todo: Todo, partialTodo: Partial<Todo>): void {
    let editedTodo = Object.assign({}, todo, partialTodo);
        
        this.todosService.updateTodo(editedTodo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: Todo) => {
            if(res) {
              this.todo = res;
              this.isEdited.emit(true);
              this.cd.markForCheck();
            }
          }
        })
  }

  protected deleteTodo(): void {
    if (this.todo.id) {
      this.todosService.deleteTodo(this.todo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isRemoved.emit(true);
          this.cd.markForCheck();
        }
      });
    }

  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

}
