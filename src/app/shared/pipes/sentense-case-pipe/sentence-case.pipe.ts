import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sentenceCase',
  standalone: true
})
export class SentenceCasePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return value;
    }

    let sentences = value.split('.').map(sentence => {
      sentence = sentence.trim();

      if (sentence.length === 0) {
        return sentence;
      }

      return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    });

    return sentences.join('. ') + (value.endsWith('.') ? '.' : '');
  }
}