import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'task-manager-theme';
  private themeSubject = new BehaviorSubject<Theme>('light');
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  
  public theme$ = this.themeSubject.asObservable();
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
  }

  setTheme(theme: Theme): void {
    const body = document.body;
    const html = document.documentElement;
    
    // Remover clases anteriores
    body.classList.remove('dark-theme', 'light-theme');
    body.removeAttribute('data-theme');
    html.removeAttribute('data-theme');
    
    // Aplicar nuevo tema
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.setAttribute('data-theme', 'dark');
      html.setAttribute('data-theme', 'dark');
      this.isDarkModeSubject.next(true);
    } else {
      body.classList.add('light-theme');
      body.setAttribute('data-theme', 'light');
      html.setAttribute('data-theme', 'light');
      this.isDarkModeSubject.next(false);
    }
    
    // Guardar en localStorage y emitir cambio
    localStorage.setItem(this.THEME_KEY, theme);
    this.themeSubject.next(theme);
    
    console.log(`Theme changed to: ${theme}`, {
      bodyClasses: body.className,
      dataTheme: body.getAttribute('data-theme')
    });
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}