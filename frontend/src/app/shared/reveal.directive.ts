import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Eklendiği eleman ekrana girince yavaşça belirir (fade-in).
 * Kullanım: <section appReveal>...</section>
 * Stiller styles.scss içindeki .reveal / .is-visible sınıflarında.
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal' },
})
export class Reveal implements OnInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    // Tarayıcı desteklemiyorsa içerik gizli kalmasın, hemen göster
    if (typeof IntersectionObserver === 'undefined') {
      this.element.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.element.classList.add('is-visible');
          this.observer?.disconnect(); // bir kez belirmesi yeterli
        }
      },
      { threshold: 0.15 },
    );
    this.observer.observe(this.element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
} 