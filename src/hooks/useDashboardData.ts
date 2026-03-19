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

  const trendsQuery = useQuery({
    queryKey: ['dashboard', 'charts', 'trends', tenantId],
    queryFn: () => dashboardService.getChartData('trends', tenantId),
    enabled: isEnabled && !!user,
  });

  const consentByTypeQuery = useQuery({
    queryKey: ['dashboard', 'charts', 'consent-by-type', tenantId],
    queryFn: () => dashboardService.getChartData('consent-by-type', tenantId),
    enabled: isEnabled && !!user,
  });

  const rightsByTypeQuery = useQuery({
    queryKey: ['dashboard', 'charts', 'rights-by-type', tenantId],
    queryFn: () => dashboardService.getChartData('rights-by-type', tenantId),
    enabled: isEnabled && !!user,
  });

  return {
    kpis: kpisQuery.data,
    isLoadingKpis: kpisQuery.isLoading,
    alerts: alertsQuery.data,
    recentActivity: recentActivityQuery.data || [],
    consentChart: consentChartQuery.data?.data || [],
    trends: trendsQuery.data?.data || [],
    consentByType: consentByTypeQuery.data?.data || [],
    rightsByType: rightsByTypeQuery.data?.data || [],
    isLoadingCharts: consentChartQuery.isLoading || trendsQuery.isLoading || consentByTypeQuery.isLoading || rightsByTypeQuery.isLoading,
    isError: kpisQuery.isError || alertsQuery.isError || recentActivityQuery.isError || trendsQuery.isError || rightsByTypeQuery.isError,
    refetchAll: async () => {
      await Promise.all([
        kpisQuery.refetch(),
        alertsQuery.refetch(),
        recentActivityQuery.refetch(),
        consentChartQuery.refetch(),
        trendsQuery.refetch(),
        consentByTypeQuery.refetch(),
        rightsByTypeQuery.refetch(),
      ]);
    }
  };
}
