import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  imports: [],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
})
export class ConfirmationModal {
  @Input() isOpen = false;
  @Input() title = 'Confirmar ação';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Voltar';
  @Input() processingLabel = 'Processando...';
  @Input() isProcessing = false;
  @Input() variant: 'primary' | 'danger' = 'primary';

  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.requestClose();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  requestClose(): void {
    if (this.isProcessing) {
      return;
    }

    this.closed.emit();
  }

  confirm(): void {
    if (this.isProcessing) {
      return;
    }

    this.confirmed.emit();
  }
}