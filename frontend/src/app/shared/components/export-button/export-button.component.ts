import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  template: `
    <div class="relative">
      <button mat-raised-button 
              [matMenuTriggerFor]="exportMenu"
              class="btn-glass"
              matTooltip="Export Data">
        <mat-icon>download</mat-icon>
        <span class="ml-2">Export</span>
      </button>
      
      <mat-menu #exportMenu="matMenu" class="export-menu">
        <button mat-menu-item (click)="exportToPDF()" class="export-menu-item">
          <mat-icon class="text-red-500">picture_as_pdf</mat-icon>
          <span>Export as PDF</span>
        </button>
        
        <button mat-menu-item (click)="exportToExcel()" class="export-menu-item">
          <mat-icon class="text-green-500">table_chart</mat-icon>
          <span>Export as Excel</span>
        </button>
        
        <button mat-menu-item (click)="exportToCSV()" class="export-menu-item">
          <mat-icon class="text-blue-500">description</mat-icon>
          <span>Export as CSV</span>
        </button>
        
        <mat-divider></mat-divider>
        
        <button mat-menu-item (click)="printReport()" class="export-menu-item">
          <mat-icon class="text-gray-500">print</mat-icon>
          <span>Print Report</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    .export-menu-item {
      @apply flex items-center space-x-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
    }
    
    .export-menu-item mat-icon {
      @apply text-lg;
    }
  `]
})
export class ExportButtonComponent {
  @Input() data: any[] = [];
  @Input() filename: string = 'export';
  @Input() title: string = 'Data Export';
  @Input() columns: string[] = [];
  @Input() headers: string[] = [];

  exportToPDF() {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(this.title, 20, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Prepare table data
    const tableHeaders = this.headers.length > 0 ? this.headers : this.getHeaders();
    const tableData = this.data.map(item => this.extractRowData(item));
    
    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 40,
      theme: 'grid',
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
        fillColor: [245, 247, 250]
      }
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }
    
    doc.save(`${this.filename}.pdf`);
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.data);
    const workbook = XLSX.utils.book_new();
    
    // Set column widths
    const colWidths = this.getHeaders().map(() => ({ wch: 15 }));
    worksheet['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Add metadata sheet
    const metadata = [
      { Property: 'Title', Value: this.title },
      { Property: 'Generated', Value: new Date().toISOString() },
      { Property: 'Records', Value: this.data.length }
    ];
    const metaSheet = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(workbook, metaSheet, 'Metadata');
    
    XLSX.writeFile(workbook, `${this.filename}.xlsx`);
  }

  exportToCSV() {
    const headers = this.getHeaders();
    const csvContent = [
      headers.join(','),
      ...this.data.map(item => this.extractRowData(item).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${this.filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  printReport() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const headers = this.getHeaders();
    const tableRows = this.data.map(item => {
      const rowData = this.extractRowData(item);
      return `<tr>${rowData.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    }).join('');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${this.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .metadata { margin-bottom: 20px; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${this.title}</h1>
          <div class="metadata">
            Generated on: ${new Date().toLocaleDateString()} | 
            Total records: ${this.data.length}
          </div>
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  private getHeaders(): string[] {
    if (this.headers.length > 0) {
      return this.headers;
    }
    
    if (this.columns.length > 0) {
      return this.columns;
    }
    
    if (this.data.length > 0) {
      return Object.keys(this.data[0]);
    }
    
    return [];
  }

  private extractRowData(item: any): any[] {
    const headers = this.getHeaders();
    return headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value.toString();
    });
  }
}