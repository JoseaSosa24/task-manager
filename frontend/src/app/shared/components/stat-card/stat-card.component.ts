import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [ngClass]="colorClass" [@slideIn]="animationState">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {{ title }}
          </p>
          <div class="flex items-baseline space-x-2">
            <span class="text-3xl font-bold text-gray-900 dark:text-white animate-count-up" 
                  [attr.data-target]="value">
              {{ displayValue }}
            </span>
            <span *ngIf="suffix" class="text-lg text-gray-500 dark:text-gray-400">
              {{ suffix }}
            </span>
          </div>
          <div *ngIf="trend" class="flex items-center mt-2">
            <i [class]="trendIcon" [ngClass]="trendColorClass"></i>
            <span class="text-sm font-medium ml-1" [ngClass]="trendColorClass">
              {{ trendValue }}{{ trendSuffix }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-1">
              vs last {{ trendPeriod }}
            </span>
          </div>
        </div>
        <div class="flex-shrink-0">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center" 
               [ngClass]="iconBgClass">
            <i [class]="icon" class="text-2xl text-white"></i>
          </div>
        </div>
      </div>
      
      <!-- Progress bar if percentage is provided -->
      <div *ngIf="percentage !== undefined" class="mt-4">
        <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span>Progress</span>
          <span>{{ percentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="h-2 rounded-full transition-all duration-1000 ease-out"
               [ngClass]="progressBarClass"
               [style.width.%]="animatedPercentage">
          </div>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideIn', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.5s ease-out')
      ])
    ])
  ]
})
export class StatCardComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() icon: string = 'pi pi-chart-bar';
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' = 'primary';
  @Input() trend?: 'up' | 'down' | 'stable';
  @Input() trendValue?: number;
  @Input() trendSuffix: string = '%';
  @Input() trendPeriod: string = 'month';
  @Input() suffix?: string;
  @Input() percentage?: number;
  @Input() animationDelay: number = 0;

  displayValue: number = 0;
  animatedPercentage: number = 0;
  animationState = 'in';
  private animationFrame?: number;

  ngOnInit() {
    setTimeout(() => {
      this.animateValue();
      if (this.percentage !== undefined) {
        this.animatePercentage();
      }
    }, this.animationDelay);
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private animateValue() {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;
    const endValue = this.value;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      this.displayValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  private animatePercentage() {
    if (this.percentage === undefined) return;
    
    setTimeout(() => {
      this.animatedPercentage = this.percentage!;
    }, 500);
  }

  get colorClass(): string {
    return this.color;
  }

  get iconBgClass(): string {
    const classes = {
      primary: 'bg-gradient-primary',
      success: 'bg-gradient-success', 
      warning: 'bg-gradient-warning',
      danger: 'bg-gradient-danger'
    };
    return classes[this.color];
  }

  get progressBarClass(): string {
    const classes = {
      primary: 'bg-gradient-primary',
      success: 'bg-gradient-success',
      warning: 'bg-gradient-warning', 
      danger: 'bg-gradient-danger'
    };
    return classes[this.color];
  }

  get trendIcon(): string {
    if (!this.trend) return '';
    
    const icons = {
      up: 'pi pi-arrow-up',
      down: 'pi pi-arrow-down',
      stable: 'pi pi-minus'
    };
    return icons[this.trend];
  }

  get trendColorClass(): string {
    if (!this.trend) return '';
    
    const classes = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      stable: 'text-gray-600 dark:text-gray-400'
    };
    return classes[this.trend];
  }
}