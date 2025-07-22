import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule],
  template: `
    <div class="export-button-container">
      <p-menu #menu [model]="exportItems" [popup]="true" styleClass="export-menu"></p-menu>
      
      <p-button
        (click)="menu.toggle($event)"
        icon="pi pi-download"
        [label]="buttonLabel"
        severity="secondary"
        size="small"
        class="export-trigger">
      </p-button>
      
      <!-- Loading overlay -->
      <div *ngIf="loading" 
           class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
        <div class="flex items-center space-x-2">
          <i class="pi pi-spin pi-spinner text-blue-500"></i>
          <span class="text-sm text-gray-600">Exporting...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .export-button-container {
      position: relative;
      display: inline-block;
    }

    ::ng-deep .export-menu {
      min-width: 180px !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
    }

    ::ng-deep .export-menu .p-menuitem-link {
      padding: 0.75rem 1rem !important;
      border-radius: 6px !important;
      margin: 0.125rem !important;
      transition: all 0.2s ease-in-out !important;
    }

    ::ng-deep .export-menu .p-menuitem-link:hover {
      background: #f3f4f6 !important;
      transform: translateX(4px);
    }

    ::ng-deep .export-menu .p-menuitem-icon {
      margin-right: 0.75rem !important;
      color: #6b7280 !important;
    }
  `]
})
export class ExportButtonComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() filename: string = 'export';
  @Input() title: string = 'Data Export';
  @Input() buttonLabel: string = 'Export';
  @Input() includeCharts: boolean = false;

  loading = false;
  exportItems: MenuItem[] = [];

  ngOnInit() {
    this.setupExportMenu();
  }

  private setupExportMenu(): void {
    this.exportItems = [
      {
        label: 'Export to PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.exportToPDF()
      },
      {
        separator: true
      },
      {
        label: 'Export to Excel',
        icon: 'pi pi-file-excel',
        command: () => this.exportToExcel()
      },
      {
        label: 'Export to CSV',
        icon: 'pi pi-file',
        command: () => this.exportToCSV()
      }
    ];
  }

  private async exportToPDF(): Promise<void> {
    if (!this.data.length) return;

    this.loading = true;
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(this.title, 14, 22);
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Prepare table data
      const headers = Object.keys(this.data[0]);
      const tableData = this.data.map(item => 
        headers.map(header => this.formatCellValue(item[header]))
      );
      
      // Add table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });
      
      // Save the PDF
      doc.save(`${this.filename}.pdf`);
      
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      this.loading = false;
    }
  }

  private async exportToExcel(): Promise<void> {
    if (!this.data.length) return;

    this.loading = true;
    
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(this.data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Auto-fit columns
      const colWidths = this.calculateColumnWidths(this.data);
      ws['!cols'] = colWidths;
      
      // Save file
      XLSX.writeFile(wb, `${this.filename}.xlsx`);
      
    } catch (error) {
      console.error('Excel export failed:', error);
    } finally {
      this.loading = false;
    }
  }

  private async exportToCSV(): Promise<void> {
    if (!this.data.length) return;

    this.loading = true;
    
    try {
      const headers = Object.keys(this.data[0]);
      const csvContent = [
        headers.join(','),
        ...this.data.map(item => 
          headers.map(header => 
            this.formatCSVValue(item[header])
          ).join(',')
        )
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${this.filename}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('CSV export failed:', error);
    } finally {
      this.loading = false;
    }
  }

  private formatCellValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    return String(value);
  }

  private formatCSVValue(value: any): string {
    const formatted = this.formatCellValue(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
      return `"${formatted.replace(/"/g, '""')}"`;
    }
    return formatted;
  }

  private calculateColumnWidths(data: any[]): any[] {
    if (!data.length) return [];
    
    const headers = Object.keys(data[0]);
    return headers.map(header => {
      const maxLength = Math.max(
        header.length,
        ...data.map(item => 
          this.formatCellValue(item[header]).length
        )
      );
      return { width: Math.min(maxLength + 2, 50) };
    });
  }
}