import { useState } from "react";
import { useEffect } from "react";
import { usersService, invitationsService, sessionsService } from "@/services/userSetupService";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Users, UserCheck, Mail, Lock, Activity, Shield } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { UserSetupTabs } from "@/components/user-setup/UserSetupTabs";
import { UserEditDialog } from "@/components/user-setup/UserEditDialog";
import { User } from "@/components/user-setup/types";

export default function UserSetup() {
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingInvites: 0,
    lockedAccounts: 0,
    activeSessions: 0
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResp, invResp, sessResp] = await Promise.all([
          usersService.getAll(),
          invitationsService.getAll(),
          sessionsService.getAll()
        ]);

        let totalUsers = 0;
        let activeUsers = 0;
        let lockedAccounts = 0;
        let pendingInvites = 0;
        let activeSessions = 0;

        if (usersResp) {
          totalUsers = usersResp.total || 0;
          const userList = usersResp.data || [];
          if (totalUsers === 0) totalUsers = userList.length;
          activeUsers = userList.filter((u) => String(u.status).toLowerCase() === 'active').length;
          lockedAccounts = userList.filter((u) => String(u.status).toLowerCase() === 'locked').length;
        }

        if (invResp) {
          const invList = invResp.data || [];
          pendingInvites = invList.filter((i) => String(i.status).toLowerCase() === 'pending').length;
        }

        if (sessResp) {
          const sessList = Array.isArray(sessResp) ? sessResp : sessResp.data || [];
          activeSessions = sessList.filter((s: any) => s.isCurrentSession || (s.lastActivity && new Date(s.lastActivity) > new Date(Date.now() - 30 * 60 * 1000))).length;
        }

        setStats({ totalUsers, activeUsers, pendingInvites, lockedAccounts, activeSessions });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, [activeTab]);

  const handleNewUser = () => {
    setEditingUser({} as User);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  return (
    <DashboardLayout
      title="User Setup"
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={handleNewUser}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New User</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add New User</TooltipContent>
        </Tooltip>
      }
    >
      <div className="space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={<Users className="h-6 w-6" />}
            variant="default"
          />
          <KPICard
            title="Active Users"
            value={stats.activeUsers.toString()}
            icon={<UserCheck className="h-6 w-6" />}
            variant="success"
          />
          <KPICard
            title="Pending Invites"
            value={stats.pendingInvites.toString()}
            icon={<Mail className="h-6 w-6" />}
            variant="warning"
          />
          <KPICard
            title="Locked Accounts"
            value={stats.lockedAccounts.toString()}
            icon={<Lock className="h-6 w-6" />}
            variant="destructive"
          />
          <KPICard
            title="Active Sessions"
            value={stats.activeSessions.toString()}
            icon={<Activity className="h-6 w-6" />}
            variant="info"
          />
        </div>

        <UserSetupTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEditUser={handleEditUser}
        />

        {/* Edit User Dialog */}
        {editingUser && (
          <UserEditDialog
            user={editingUser}
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
