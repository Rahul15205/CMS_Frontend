import { useState } from "react";
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
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
            value="25"
            icon={<Users className="h-6 w-6" />}
            variant="default"
          />
          <KPICard
            title="Active Users"
            value="22"
            icon={<UserCheck className="h-6 w-6" />}
            variant="success"
          />
          <KPICard
            title="Pending Invites"
            value="3"
            icon={<Mail className="h-6 w-6" />}
            variant="warning"
          />
          <KPICard
            title="Locked Accounts"
            value="1"
            icon={<Lock className="h-6 w-6" />}
            variant="destructive"
          />
          <KPICard
            title="Active Sessions"
            value="18"
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
