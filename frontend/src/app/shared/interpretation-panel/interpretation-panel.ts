import { Component, input, output } from '@angular/core';

import { Interpretation } from '../../core/models/interpretation';

/** Ev ya da nokta kartına tıklanınca açılan açıklama kutusu */
@Component({
  selector: 'app-interpretation-panel',
  templateUrl: './interpretation-panel.html',
  styleUrl: './interpretation-panel.scss',
  host: {
    '(document:keydown.escape)': 'closed.emit()', // Esc ile kapansın
  },
})
export class InterpretationPanel {
  readonly interpretation = input.required<Interpretation>();
  readonly closed = output<void>();
} 