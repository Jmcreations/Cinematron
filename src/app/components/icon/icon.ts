import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  imports: [CommonModule],
  templateUrl: './icon.html'
})
export class IconComponent {
  // Update the Input line to include the chevrons
@Input() name: 'search' | 'close' | 'play' | 'plus' | 'user' | 'chevron-left' | 'chevron-right' | 'chevron-down' = 'play';
}