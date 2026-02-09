import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';

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

  constructor(private requestService: RequestService) {}

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest = {
      title: this.title,
      description: this.description,
      priority: this.priority as any,
      status: this.status as any
    };

    this.requestService.createRequest(newRequest);
    this.requestCreated.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.priority = 'Medium';
    this.status = 'Open';
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }
}
