import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { List } from '../common/list.interface';
import { ListComponent } from '../list/list.component';
import { TaskComponent } from '../task/task.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ListComponent, NgFor, ReactiveFormsModule, TaskComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  lists!: List[];
  createListForm = new FormGroup({
    name: new FormControl(''),
    content: new FormControl(''),
  });
  newTasks: string[] = [];

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.fetchLists();
  }

  addTask(event: Event) {
    event.preventDefault();
    const content = this.createListForm.get('content')?.value;
    if (content) this.newTasks.push(content);
  }

  async createList() {
    const name = this.createListForm.get('name')?.value;

    if (name)
      firstValueFrom(this.httpClient.post('http://localhost:9000/lists', { name })).then((list: any) => {
        Promise.all(
          this.newTasks.map((newTask) => {
            firstValueFrom(this.httpClient.post('http://localhost:9000/tasks', { listId: list.id, content: newTask }));
          }),
        ).then(() => this.fetchLists());
      });

    this.createListForm.setValue({ name: '', content: '' });
  }

  fetchLists() {
    firstValueFrom(this.httpClient.get('http://localhost:9000/lists')).then((lists: any) => {
      this.lists = lists;
    });
  }
}
