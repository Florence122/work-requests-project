import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent {
  @Output() requestCreated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  title = '';
  description = '';
  priority = 'Medium';
  status = 'Open';

  onSubmit(): void {
    console.log('Request created:', { 
      title: this.title, 
      description: this.description,
      priority: this.priority,
      status: this.status
    });
    this.requestCreated.emit();
  }
}
