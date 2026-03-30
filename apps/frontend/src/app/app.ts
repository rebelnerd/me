import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastContainerComponent } from '@app/design-system';

@Component({
  imports: [RouterModule, ToastContainerComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
