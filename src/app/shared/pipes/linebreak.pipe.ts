import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linebreak',
  standalone: false
})
export class LinebreakPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    
    // Replace line breaks with <br> tags and preserve formatting
    return value
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

}
