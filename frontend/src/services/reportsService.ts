/**
 * Reports Service
 * Handles all report generation and data fetching for the Reports module
 */

import apiClient from './api';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export interface ReportMetrics {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  financial_summary: {
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
    average_daily_revenue: number;
    average_cash_flow: number;
  };
  unit_economics: {
    ltv: number;
    coca: number;
    ltv_coca_ratio: number;
    roi: number;
    total_customers: number;
    revenue_per_customer: number;
  };
  growth_metrics: {
    revenue_growth: number;
    customer_growth: number;
    daily_growth_rate: number;
  };
  detailed_data: Array<{
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
    cash_flow: number;
    customers: number;
    units_sold: number;
  }>;
  ai_insights?: any;
}

export interface KPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  variance: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description?: string;
}

export interface ExpenseOptimization {
  current_expenses: {
    categories: Array<{
      name: string;
      amount: number;
      percentage: number;
    }>;
    total_expenses: number;
    target_reduction: number;
  };
  optimizations: Array<{
    category: string;
    current_amount: number;
    recommended_amount: number;
    savings: number;
    impact: string;
    explanation: string;
    priority: string;
  }>;
  projected_savings: {
    total_amount: number;
    percentage: number;
    annual_impact: number;
  };
  ai_insights: any;
  implementation_timeline: string;
  confidence_score: number;
}

export interface FinancialForecast {
  forecast_date: string;
  target_month: string;
  historical_trends: {
    revenue_monthly_growth: number;
    expense_monthly_growth: number;
    customer_monthly_growth: number;
  };
  scenarios: {
    conservative: ForecastScenario;
    realistic: ForecastScenario;
    optimistic: ForecastScenario;
  };
  recommendations: string[];
  key_metrics_to_monitor: string[];
  ai_insights: any;
  confidence_level: number;
}

interface ForecastScenario {
  revenue: number;
  expenses: number;
  customers: number;
  probability: number;
  profit: number;
  profit_margin: number;
  revenue_per_customer: number;
}

class ReportsService {
  /**
   * Generate a comprehensive report
   */
  async generateReport(
    reportType: 'financial' | 'operational' | 'marketing' | 'comprehensive',
    periodDays: number,
    format: 'json' | 'pdf' | 'excel' | 'csv' = 'json'
  ): Promise<ReportMetrics | void> {
    try {
      const response = await apiClient.post('/reports/generate', {
        report_type: reportType,
        period_days: periodDays,
        format: format
      });

      if (format === 'json') {
        return response.data;
      } else {
        // For file formats, the backend returns a file response
        const blob = new Blob([response.data], {
          type: format === 'pdf' ? 'application/pdf' :
                format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                'text/csv'
        });
        
        const filename = `katalis_report_${reportType}_${new Date().toISOString().split('T')[0]}.${
          format === 'excel' ? 'xlsx' : format
        }`;
        
        saveAs(blob, filename);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Export report in specific format (client-side generation)
   */
  async exportReport(
    metrics: ReportMetrics,
    reportType: string,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<void> {
    try {
      // Use backend endpoint for file generation
      await this.generateReport(
        reportType as any,
        metrics.period.days,
        format
      );
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Get real-time KPIs
   */
  async getKPIs(periodDays: number = 30): Promise<{
    period_days: number;
    last_updated: string;
    kpis: KPI[];
    summary: {
      excellent_count: number;
      good_count: number;
      warning_count: number;
      critical_count: number;
    };
  }> {
    try {
      const response = await apiClient.get('/reports/kpis', {
        params: { period_days: periodDays }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  }

  /**
   * Get expense optimization recommendations
   */
  async optimizeExpenses(): Promise<ExpenseOptimization> {
    try {
      const response = await apiClient.post('/reports/optimize-expenses');
      return response.data;
    } catch (error) {
      console.error('Error optimizing expenses:', error);
      throw error;
    }
  }

  /**
   * Get financial forecast for next month
   */
  async getFinancialForecast(): Promise<FinancialForecast> {
    try {
      const response = await apiClient.post('/reports/project-forecast');
      return response.data;
    } catch (error) {
      console.error('Error getting forecast:', error);
      throw error;
    }
  }

  /**
   * Get historical data for a specific period
   */
  async getHistoricalData(periodDays: number): Promise<ReportMetrics['detailed_data']> {
    try {
      const response = await this.generateReport('financial', periodDays, 'json');
      return (response as ReportMetrics)?.detailed_data || [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  /**
   * Calculate derived metrics from raw data
   */
  calculateMetrics(data: ReportMetrics['detailed_data']): {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    avgCashFlow: number;
    growthRate: number;
  } {
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const avgCashFlow = data.reduce((sum, d) => sum + d.cash_flow, 0) / data.length;
    
    // Calculate growth rate
    const firstRevenue = data[0]?.revenue || 1;
    const lastRevenue = data[data.length - 1]?.revenue || 1;
    const growthRate = ((lastRevenue / firstRevenue) - 1) * 100;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      avgCashFlow,
      growthRate
    };
  }

  /**
   * Get revenue breakdown by category
   */
  async getRevenueBreakdown(): Promise<Array<{ name: string; value: number; color: string }>> {
    try {
      const metrics = await this.generateReport('financial', 30, 'json');
      
      // Calculate breakdown from data
      const totalRevenue = (metrics as ReportMetrics)?.financial_summary?.total_revenue || 0;
      
      // These percentages could come from backend analysis
      return [
        { name: 'Producto Principal', value: totalRevenue * 0.6, color: '#3ECF8E' },
        { name: 'Servicios', value: totalRevenue * 0.25, color: '#10B981' },
        { name: 'Consultoría', value: totalRevenue * 0.15, color: '#059669' }
      ];
    } catch (error) {
      console.error('Error getting revenue breakdown:', error);
      // Return default values
      return [
        { name: 'Producto Principal', value: 228258, color: '#3ECF8E' },
        { name: 'Servicios', value: 95107, color: '#10B981' },
        { name: 'Consultoría', value: 57065, color: '#059669' }
      ];
    }
  }

  /**
   * Get expense breakdown by category
   */
  async getExpenseBreakdown(): Promise<Array<{ name: string; value: number; color: string }>> {
    try {
      const optimization = await this.optimizeExpenses();
      
      return optimization.current_expenses.categories.map((cat, index) => ({
        name: cat.name,
        value: cat.amount,
        color: ['#EF4444', '#F59E0B', '#EC4899', '#8B5CF6', '#6B7280'][index] || '#6B7280'
      }));
    } catch (error) {
      console.error('Error getting expense breakdown:', error);
      // Return default values
      return [
        { name: 'Nómina', value: 110000, color: '#EF4444' },
        { name: 'Marketing', value: 55000, color: '#F59E0B' },
        { name: 'Operaciones', value: 66000, color: '#EC4899' },
        { name: 'Tecnología', value: 24000, color: '#8B5CF6' },
        { name: 'Otros', value: 20000, color: '#6B7280' }
      ];
    }
  }

  /**
   * Generate PDF report client-side
   */
  generatePDFReport(
    data: any,
    reportType: string,
    timeRange: string
  ): void {
    try {
      const doc = new jsPDF();
      
      // Set font
      doc.setFontSize(20);
      doc.text('REPORTE FINANCIERO - KATALISAPP', 20, 30);
      
      // Report metadata
      doc.setFontSize(12);
      doc.text(`Período: ${this.formatTimeRange(timeRange)}`, 20, 50);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`, 20, 60);
      doc.text(`Tipo de reporte: ${this.formatReportType(reportType)}`, 20, 70);
      
      // Executive Summary
      doc.setFontSize(16);
      doc.text('RESUMEN EJECUTIVO', 20, 90);
      doc.setFontSize(10);
      
      const summaryY = 100;
      doc.text(`Ingresos Totales: ${this.formatCurrency(data.totalRevenue || 0)}`, 20, summaryY);
      doc.text(`Gastos Totales: ${this.formatCurrency(data.totalExpenses || 0)}`, 20, summaryY + 10);
      doc.text(`Ganancia Neta: ${this.formatCurrency(data.netProfit || 0)}`, 20, summaryY + 20);
      doc.text(`Flujo de Caja: ${this.formatCurrency(data.cashFlow || 0)}`, 20, summaryY + 30);
      doc.text(`ROI: ${data.roi || 0}%`, 20, summaryY + 40);
      doc.text(`Tasa de Crecimiento: ${data.growthRate || 0}%`, 20, summaryY + 50);
      
      // KPIs Section
      if (data.kpis && data.kpis.length > 0) {
        doc.setFontSize(16);
        doc.text('INDICADORES CLAVE (KPIs)', 20, summaryY + 70);
        doc.setFontSize(10);
        
        let kpiY = summaryY + 80;
        data.kpis.forEach((kpi: any, index: number) => {
          const status = kpi.status === 'excellent' ? 'Excelente' : 
                        kpi.status === 'good' ? 'Bueno' : 
                        kpi.status === 'warning' ? 'Atención' : 'Crítico';
          doc.text(`${kpi.name}: ${kpi.value}${kpi.unit} (${status})`, 20, kpiY + (index * 10));
        });
      }
      
      // Historical data section
      if (data.historicalData && data.historicalData.length > 0) {
        const dataY = summaryY + 140;
        doc.setFontSize(16);
        doc.text('DATOS HISTÓRICOS', 20, dataY);
        doc.setFontSize(10);
        
        data.historicalData.forEach((item: any, index: number) => {
          const text = `${item.period}: Ingresos ${this.formatCurrency(item.revenue)}, Gastos ${this.formatCurrency(item.expenses)}, Ganancia ${this.formatCurrency(item.profit)}`;
          doc.text(text, 20, dataY + 10 + (index * 10));
        });
      }
      
      // Footer
      doc.setFontSize(8);
      doc.text('Reporte generado automáticamente por KatalisApp', 20, 280);
      doc.text('© 2024 KatalisApp - Finanzas para Emprendedores', 20, 285);
      
      // Save the PDF
      const fileName = `katalis_reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  }

  /**
   * Generate Excel report client-side
   */
  generateExcelReport(
    data: any,
    reportType: string,
    timeRange: string
  ): void {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['REPORTE FINANCIERO - KATALISAPP'],
        [''],
        ['Período', this.formatTimeRange(timeRange)],
        ['Fecha de generación', new Date().toLocaleDateString('es-MX')],
        ['Tipo de reporte', this.formatReportType(reportType)],
        [''],
        ['RESUMEN EJECUTIVO'],
        ['Ingresos Totales', data.totalRevenue || 0],
        ['Gastos Totales', data.totalExpenses || 0],
        ['Ganancia Neta', data.netProfit || 0],
        ['Flujo de Caja', data.cashFlow || 0],
        ['ROI (%)', data.roi || 0],
        ['Tasa de Crecimiento (%)', data.growthRate || 0]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
      
      // Historical data sheet
      if (data.historicalData && data.historicalData.length > 0) {
        const historicalSheet = XLSX.utils.json_to_sheet(data.historicalData);
        XLSX.utils.book_append_sheet(workbook, historicalSheet, 'Datos Históricos');
      }
      
      // KPIs sheet
      if (data.kpis && data.kpis.length > 0) {
        const kpisSheet = XLSX.utils.json_to_sheet(data.kpis);
        XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');
      }
      
      // Save the Excel file
      const fileName = `katalis_reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw new Error('Error al generar el Excel. Por favor, intenta nuevamente.');
    }
  }

  /**
   * Generate CSV report client-side
   */
  generateCSVReport(
    data: any,
    reportType: string,
    timeRange: string
  ): void {
    try {
      let csvContent = 'REPORTE FINANCIERO - KATALISAPP\n';
      csvContent += `Período,${this.formatTimeRange(timeRange)}\n`;
      csvContent += `Fecha de generación,${new Date().toLocaleDateString('es-MX')}\n`;
      csvContent += `Tipo de reporte,${this.formatReportType(reportType)}\n\n`;
      
      // Executive summary
      csvContent += 'RESUMEN EJECUTIVO\n';
      csvContent += 'Métrica,Valor\n';
      csvContent += `Ingresos Totales,${data.totalRevenue || 0}\n`;
      csvContent += `Gastos Totales,${data.totalExpenses || 0}\n`;
      csvContent += `Ganancia Neta,${data.netProfit || 0}\n`;
      csvContent += `Flujo de Caja,${data.cashFlow || 0}\n`;
      csvContent += `ROI,${data.roi || 0}%\n`;
      csvContent += `Tasa de Crecimiento,${data.growthRate || 0}%\n\n`;
      
      // Historical data
      if (data.historicalData && data.historicalData.length > 0) {
        csvContent += 'DATOS HISTÓRICOS\n';
        csvContent += 'Período,Ingresos,Gastos,Ganancia,Flujo de Caja,Clientes\n';
        data.historicalData.forEach((item: any) => {
          csvContent += `${item.period},${item.revenue},${item.expenses},${item.profit},${item.cashFlow},${item.customers || 0}\n`;
        });
        csvContent += '\n';
      }
      
      // KPIs
      if (data.kpis && data.kpis.length > 0) {
        csvContent += 'INDICADORES CLAVE (KPIs)\n';
        csvContent += 'Indicador,Valor,Unidad,Estado,Meta,Varianza\n';
        data.kpis.forEach((kpi: any) => {
          csvContent += `${kpi.name},${kpi.value},${kpi.unit},${kpi.status},${kpi.target || ''},${kpi.variance || ''}%\n`;
        });
      }
      
      // Save CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const fileName = `katalis_reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw new Error('Error al generar el CSV. Por favor, intenta nuevamente.');
    }
  }

  /**
   * Helper methods for formatting
   */
  private formatTimeRange(timeRange: string): string {
    switch (timeRange) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '90d': return 'Últimos 90 días';
      case '1y': return 'Último año';
      default: return 'Período personalizado';
    }
  }

  private formatReportType(reportType: string): string {
    switch (reportType) {
      case 'financial': return 'Financiero';
      case 'operational': return 'Operacional';
      case 'marketing': return 'Marketing';
      case 'comprehensive': return 'Ejecutivo Integral';
      default: return 'General';
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}

// Export singleton instance
export const reportsService = new ReportsService();
export default reportsService;