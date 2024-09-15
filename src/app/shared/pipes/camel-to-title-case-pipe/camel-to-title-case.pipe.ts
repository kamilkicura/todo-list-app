import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelToTitleCase',
  standalone: true
})
export class CamelToTitleCasePipe implements PipeTransform {

  transform(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}