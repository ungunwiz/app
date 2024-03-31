import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WordingService {
  constructor() {}

  private platform = environment.platform;

  private wording: any = {
    web: {
      app: 'page',
      restart: 'reload',
    },
    app: {
      app: 'app',
      restart: 'restart',
    },
  };

  public getWord(word: string) {
    return this.wording[this.platform][word];
  }
}
