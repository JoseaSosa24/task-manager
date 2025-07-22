import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-widget.component.html',
  styles: [`
    .btn-active {
      @apply bg-blue-500 text-white shadow-md;
    }
    
    .btn-inactive {
      @apply bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600;
    }
  `]
})
export class ChartWidgetComponent implements OnInit, OnDestroy {
  @Input() type: ChartType = 'line';
  @Input() data?: ChartData;
  @Input() title: string = '';
  @Input() showLegend: boolean = true;
  @Input() loading: boolean = false;
  @Input() periods: string[] = ['7D', '30D', '90D', '1Y'];
  
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  selectedPeriod: string = '30D';
  private chart?: Chart;

  ngOnInit() {
    if (this.data) {
      this.createChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx || !this.data) return;

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // We handle legend manually
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: (context) => {
                return context[0].label || '';
              },
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || context.parsed;
                return `${label}: ${this.formatValue(value)}`;
              }
            }
          }
        },
        scales: this.getScalesConfig(),
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
            backgroundColor: 'white',
            borderWidth: 2
          },
          line: {
            tension: 0.4,
            borderWidth: 3
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private getScalesConfig() {
    if (this.type === 'doughnut' || this.type === 'pie') {
      return {};
    }

    return {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 12
          },
          callback: (value: any) => this.formatValue(value)
        }
      }
    };
  }

  private formatValue(value: any): string {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toString();
    }
    return value;
  }

  getDatasetColor(dataset: any): string {
    if (Array.isArray(dataset.backgroundColor)) {
      return dataset.backgroundColor[0];
    }
    return dataset.backgroundColor || dataset.borderColor || '#3b82f6';
  }
}