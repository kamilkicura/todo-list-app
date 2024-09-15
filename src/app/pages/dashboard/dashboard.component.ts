import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import { AuthGoogleService } from '../../services/auth-google.service';
import { TopNavigationComponent } from "../../shared/components/top-navigation/top-navigation.component";
import { TodoListComponent } from "../../shared/components/todo-list/todo-list.component";
import { TodosService } from '../../services/todos.service';
import { TodoList } from '../../models/todo-list';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddDialogComponent } from '../../shared/dialogs/add-dialog/add-dialog.component';
import { AddDialogData } from '../../models/add-dialog-data';
import { BaseComponent } from '../../shared/components/base/base.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TopNavigationComponent, TodoListComponent, CommonModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent extends BaseComponent implements OnInit, OnDestroy {

  protected profile: any;
  protected todoList: TodoList[] = [];
  private authService = inject(AuthGoogleService);
  private todosService = inject(TodosService);
  private dialog = inject(MatDialog);
  private cd = inject(ChangeDetectorRef);


  ngOnInit(): void {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.profile = JSON.parse(user);
      this.loadTodoList();
    } else {
      this.showData();
    }
    this.cd.markForCheck();

  }

  showData() {
    this.authService.tokenReceived$
    .pipe(takeUntil(this.destroy$))
    .subscribe((isToken: boolean) => {
      if (isToken) {
        this.profile = this.authService.getProfile();
        localStorage.setItem('userInfo', JSON.stringify(this.profile));
        localStorage.setItem('token', this.authService.getToken());
        if (this.profile?.sub) {
          this.loadTodoList();
        }
      }
    });
  }

  public loadTodoList(): void {
    this.todosService.getTodoList(this.profile?.sub)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (todoList: TodoList[]) => {
        this.todoList = todoList ? todoList : [];
        this.cd.markForCheck();
      }
    })
  }

  protected addNewList(): void {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: {
        title:'Add TodoList',
        controls: ['title']
      } as AddDialogData<TodoList>
    });
  
    dialogRef.afterClosed().subscribe((result: Partial<TodoList>) => {
      this.createTodoList(result);
    })
  
  }
  
  private createTodoList(partialTodo: Partial<TodoList>): void {
    let newTodoList: Partial<TodoList> = partialTodo;
    newTodoList.userId = this.profile.sub;
  
    this.todosService.addTodoList(newTodoList)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: TodoList) => {
        if(res) {
          this.todoList.push(res);
          this.cd.markForCheck();
        }
      }
    })
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}