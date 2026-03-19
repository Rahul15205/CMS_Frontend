export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDashboardToCSV(data: {
  kpis?: any;
  consentChart?: any[];
  trends?: any[];
  recentActivity?: any[];
}) {
  let csv = '';

  // 1. KPIs Section
  if (data.kpis) {
    csv += '--- KPI Summary ---\n';
    csv += 'Metric,Value\n';
    if (data.kpis.totalActiveConsents !== undefined) csv += `Total Active Consents,${data.kpis.totalActiveConsents}\n`;
    if (data.kpis.expiredWithdrawnConsents !== undefined) csv += `Expired/Withdrawn Consents,${data.kpis.expiredWithdrawnConsents}\n`;
    if (data.kpis.pendingRights !== undefined) csv += `Pending Rights Requests,${data.kpis.pendingRights}\n`;
    if (data.kpis.openGrievances !== undefined) csv += `Open Grievances,${data.kpis.openGrievances}\n`;
    if (data.kpis.slaBreaches !== undefined) csv += `SLA Breaches,${data.kpis.slaBreaches}\n`;
    if (data.kpis.complianceScore !== undefined) csv += `Compliance Score,${data.kpis.complianceScore}%\n`;
    if (data.kpis.totalUsers !== undefined) csv += `Total Users,${data.kpis.totalUsers}\n`;
    csv += '\n';
  }

  // 2. Consent Distribution Section
  if (data.consentChart && data.consentChart.length > 0) {
    csv += '--- Consent Distribution ---\n';
    csv += 'Status,Count\n';
    data.consentChart.forEach((item: any) => {
      csv += `"${item.label || item.name}",${item.count || item.value}\n`;
    });
    csv += '\n';
  }

  // 3. Trends Section
  if (data.trends && data.trends.length > 0) {
    csv += '--- Activity Trends ---\n';
    // Get headers from first item items keys
    const headers = Object.keys(data.trends[0]).filter(k => k !== 'name' && k !== 'id');
    csv += `Month,${headers.join(',')}\n`;
    
    data.trends.forEach((item: any) => {
      const rowData = headers.map(h => item[h] || 0);
      csv += `"${item.name}",${rowData.join(',')}\n`;
    });
    csv += '\n';
  }

  // 4. Recent Activity
  if (data.recentActivity && data.recentActivity.length > 0) {
    csv += '--- Recent Activity ---\n';
    csv += 'Action,Details,Date\n';
    data.recentActivity.forEach((item: any) => {
      const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
      csv += `"${item.action || ''}","${(item.details || '').replace(/"/g, '""')}",${date}\n`;
    });
  }

  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `dashboard-report-${timestamp}.csv`);
}
