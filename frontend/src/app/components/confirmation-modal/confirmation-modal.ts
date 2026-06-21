import { FormsModule } from '@angular/forms';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  imports: [FormsModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
})

export class ConfirmationModal implements OnChanges {
  @Input() isOpen = false;
  @Input() title = 'Confirmar ação';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Voltar';
  @Input() processingLabel = 'Processando...';
  @Input() isProcessing = false;
  @Input() variant: 'primary' | 'danger' = 'primary';

  @Input() requiresComment = false;
  @Input() commentLabel = 'Comentário';
  @Input() commentPlaceholder = '';
  @Input() commentRequiredMessage = 'Informe um comentário.';
  @Input() commentMaxLength = 500;

  @Output() confirmed = new EventEmitter<string | null>();
  @Output() closed = new EventEmitter<void>();

  comment = '';
  validationMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.comment = '';
      this.validationMessage = '';
    }
  }

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

  onCommentChange(value: string): void {
    this.comment = value;

    if (value.trim()) {
      this.validationMessage = '';
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

    const normalizedComment = this.comment.trim();

    if (this.requiresComment && !normalizedComment) {
      this.validationMessage = this.commentRequiredMessage;
      return;
    }

    this.confirmed.emit(
      this.requiresComment ? normalizedComment : null,
    );
  }
}