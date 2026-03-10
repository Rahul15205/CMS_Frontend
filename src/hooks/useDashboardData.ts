import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export function useDashboardData() {
  const { user } = useAuth();
  const tenantId = (user as any)?.tenantId;
  const isEnabled = FEATURE_FLAGS.dashboard;

  const kpisQuery = useQuery({
    queryKey: ['dashboard', 'kpis', tenantId],
    queryFn: () => dashboardService.getKpis(tenantId),
    enabled: isEnabled && !!user,
  });

  const alertsQuery = useQuery({
    queryKey: ['dashboard', 'alerts', tenantId],
    queryFn: () => dashboardService.getAlerts(tenantId),
    enabled: isEnabled && !!user,
  });

  const recentActivityQuery = useQuery({
    queryKey: ['dashboard', 'recent-activity', tenantId],
    queryFn: () => dashboardService.getRecentActivity(tenantId, 5),
    enabled: isEnabled && !!user,
  });

  const consentChartQuery = useQuery({
    queryKey: ['dashboard', 'charts', 'consent-status', tenantId],
    queryFn: () => dashboardService.getChartData('consent-status', tenantId),
    enabled: isEnabled && !!user,
  });

  return {
    kpis: kpisQuery.data,
    isLoadingKpis: kpisQuery.isLoading,
    alerts: alertsQuery.data,
    recentActivity: recentActivityQuery.data || [],
    consentChart: consentChartQuery.data?.data || [],
    isLoadingCharts: consentChartQuery.isLoading,
    isError: kpisQuery.isError || alertsQuery.isError || recentActivityQuery.isError,
    refetchAll: () => {
      kpisQuery.refetch();
      alertsQuery.refetch();
      recentActivityQuery.refetch();
      consentChartQuery.refetch();
    }
  };
}
