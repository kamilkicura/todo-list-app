import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoList } from '../../../models/todo-list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilterValue, FormFilter } from '../../../models/form-filter';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TodosService } from '../../../services/todos.service';
import { Todo } from '../../../models/todo';
import { TodoComponent } from "../todo/todo.component";
import { MatDialog } from '@angular/material/dialog';
import { AddDialogComponent } from '../../dialogs/add-dialog/add-dialog.component';
import { AddDialogData } from '../../../models/add-dialog-data';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatInputModule, ReactiveFormsModule, TodoComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {

  @Input() list!: TodoList;

  private fb = inject(FormBuilder);
  private todosService = inject(TodosService);
  private dialog = inject(MatDialog);
  private cd = inject(ChangeDetectorRef);
  private listId: string = '';

  protected checkedSearchValue: string = '';
  protected checkedStatusValue: FilterValue = 'all';

  protected formFilter: FormGroup<FormFilter> = 
    this.fb.group<FormFilter>({
      searchFilter: this.fb.control<string | null>(this.checkedSearchValue),
      statusFilter: this.fb.control<FilterValue | null>(this.checkedStatusValue),
    });

  protected filteredTodos: Todo[] = [];
  private todos: Todo[] = [];

  public ngOnInit(): void {
    this.checkValueFromSearch();
    this.checkValueFromSelect();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['list'].currentValue && this.list.id) {
      this.listId = this.list.id;
      this.loadTodos(this.list.id);
      this.cd.markForCheck();
    }
  }

  private checkValueFromSearch(): void {
    this.formFilter.get('searchFilter')?.valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged(), 
        takeUntil(this.destroy$)
      )
      .subscribe((value: string | null) => {
        this.formFilter.get('searchFilter')?.setValue(value?.length ? value : '');
        this.checkedSearchValue = value?.length ? value : '';
        this.applyTodosFilters();
      });
  }

  private checkValueFromSelect(): void {
    this.formFilter.get('statusFilter')?.valueChanges
      .pipe(
        distinctUntilChanged(), 
        takeUntil(this.destroy$)
      )
      .subscribe((value: FilterValue | null) => {
        this.formFilter.get('statusFilter')?.setValue(value ?? 'all');
        this.checkedStatusValue = value ?? 'all';
        this.applyTodosFilters();
      });  
  }

  protected applyTodosFilters(): void {
    switch (this.checkedStatusValue) {

      case 'all':
        this.filteredTodos = this.checkedSearchValue?.length 
        ? this.todos.filter((todo: Todo) => todo.title.toLowerCase().includes(this.checkedSearchValue.toLowerCase()))
        : this.todos;
        break;

      case 'active':
        this.filteredTodos = this.todos.filter((todo: Todo) => todo.isActive);
        this.filteredTodos = this.checkedSearchValue?.length
        ? this.filteredTodos.filter((todo: Todo) => todo.title.toLowerCase().includes(this.checkedSearchValue.toLowerCase()))
        : this.filteredTodos;
        break;

      case 'completed':
        this.filteredTodos = this.todos.filter((todo: Todo) => !todo.isActive);
        this.filteredTodos = this.checkedSearchValue?.length
        ? this.filteredTodos.filter((todo: Todo) => todo.title.toLowerCase().includes(this.checkedSearchValue.toLowerCase()))
        : this.filteredTodos;
        break;
    }

    this.cd.markForCheck();

  }

  protected updateTodos(canUpdate: boolean): void {
    if(canUpdate) {
      this.loadTodos(this.listId);
    }
  }

  private loadTodos(listId: string): void {
    this.todosService.getTodosFromList(listId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (todos) => {
        this.todos = todos ? todos : [];
        this.applyTodosFilters();
      },
      error: () => {
        this.todos = [];
        this.applyTodosFilters();
      }
    })
  }

  protected removeTodoFromList(value: boolean): void {
    if (value && this.list.id) {
      this.loadTodos(this.list.id);
      this.applyTodosFilters();
    }
  }
  
  protected addNewTodo(): void {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: {
        title:'Add Todo',
        controls: ['title', 'text', 'deadlineDate']
      } as AddDialogData<Todo>
    });

    dialogRef.afterClosed().subscribe((result: Partial<Todo>) => {
      this.createTodo(result);
      this.cd.markForCheck();
    })

  }

  private createTodo(partialTodo: Partial<Todo>): void {
    let newTodo: Partial<Todo> = partialTodo;
    newTodo.isActive = true;
    newTodo.listId = this.list.id;

    this.todosService.addTodo(newTodo)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: Todo) => {
        if (res) {
          this.todos.push(res);
          this.applyTodosFilters();
        }
      }
    })
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

}