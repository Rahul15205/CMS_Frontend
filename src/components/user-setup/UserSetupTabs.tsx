import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Mail, Lock, Activity, History } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserManagement } from "./UserManagement";
import { RoleManagement } from "./RoleManagement";
import { InvitationManagement } from "./InvitationManagement";
import { AccessRestrictions } from "./AccessRestrictions";
import { SessionManagement } from "./SessionManagement";
import { AuditHistory } from "./AuditHistory";

import { User } from "./types";

interface UserSetupTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEditUser: (user: User) => void;
}

export function UserSetupTabs({ activeTab, onTabChange, onEditUser }: UserSetupTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      {/* Mobile Tab Selector */}
      <div className="sm:hidden mb-4">
        <Select value={activeTab} onValueChange={onTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </div>
            </SelectItem>
            <SelectItem value="roles">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Roles</span>
              </div>
            </SelectItem>
            <SelectItem value="invitations">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Invitations</span>
              </div>
            </SelectItem>
            <SelectItem value="access">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Access</span>
              </div>
            </SelectItem>
            <SelectItem value="sessions">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Sessions</span>
              </div>
            </SelectItem>
            <SelectItem value="audit">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Audit</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs List */}
      <TabsList className="hidden sm:grid w-full grid-cols-6 mb-6 h-auto p-1 bg-muted/50">
        <TabsTrigger value="users" className="flex items-center gap-2 py-2.5 text-xs sm:text-sm">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Users</span>
        </TabsTrigger>
        <TabsTrigger value="roles" className="flex items-center gap-2 py-2.5 text-xs sm:text-sm">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Roles</span>
        </TabsTrigger>
        <TabsTrigger value="invitations" className="flex items-center gap-2 py-2.5 text-xs sm:text-sm">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Invitations</span>
        </TabsTrigger>
        <TabsTrigger value="access" className="flex items-center gap-2 py-2.5 text-xs sm:text-sm">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Access</span>
        </TabsTrigger>
        <TabsTrigger value="sessions" className="flex items-center gap-2 py-2.5 text-xs sm:text-sm">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Sessions</span>
        </TabsTrigger>
        <TabsTrigger value="audit" className="flex items-center gap-2 py-2.5 text-xs sm:text-sm">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Audit</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-0">
        <UserManagement onEditUser={onEditUser} />
      </TabsContent>
      <TabsContent value="roles" className="mt-0">
        <RoleManagement />
      </TabsContent>
      <TabsContent value="invitations" className="mt-0">
        <InvitationManagement />
      </TabsContent>
      <TabsContent value="access" className="mt-0">
        <AccessRestrictions />
      </TabsContent>
      <TabsContent value="sessions" className="mt-0">
        <SessionManagement />
      </TabsContent>
      <TabsContent value="audit" className="mt-0">
        <AuditHistory />
      </TabsContent>
    </Tabs>
  );
}
