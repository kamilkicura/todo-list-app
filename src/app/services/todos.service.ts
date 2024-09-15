import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TodoList } from '../models/todo-list';
import { Todo } from '../models/todo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodosService {

  private apiUrl: string = environment.apiUrl;

  private http = inject(HttpClient);

  public getTodoList(userId: string): Observable<TodoList[]> {
    return this.http.get<TodoList[]>(`${this.apiUrl}/todo-list?userId=${userId}`);
  }

  public getTodosFromList(listId: string): Observable<Todo[]> { 
    return this.http.get<Todo[]>(`${this.apiUrl}/todos?listId=${listId}`);
  }

  public deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/todos/${id}`);
  }

  public addTodo(newTodo: Partial<Todo>): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, newTodo);
  }

  public addTodoList(newList: Partial<TodoList>): Observable<TodoList> {
    return this.http.post<TodoList>(`${this.apiUrl}/todo-list`, newList);
  }

  public updateTodo(updatedTodo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/todos/${updatedTodo.id}`, updatedTodo);
  }
  

}
