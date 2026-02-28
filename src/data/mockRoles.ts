import { Role, ModulePermissions } from "@/components/user-setup/types";

export const modules = [
    "Dashboard",
    "Consent Management",
    "Rights Management",
    "Grievances",
    "Cookies Management",
    "Notices",
    "Configurations",
    "Integrations",
    "Security",
    "Settings",
    "User Setup",
    "Reports",
    "Logs",
];

export const permissionTypes = ["view", "create", "edit", "approve", "export", "configure", "admin"];

export const defaultPermissions: ModulePermissions = modules.reduce((acc, module) => {
    acc[module] = {
        view: false,
        create: false,
        edit: false,
        approve: false,
        export: false,
        configure: false,
        admin: false,
    };
    return acc;
}, {} as ModulePermissions);

export const mockRoles: Role[] = [
    {
        id: "1",
        name: "Admin",
        description: "Full system access with all permissions",
        isSystemRole: true,
        status: "active",
        usersCount: 2,
        permissions: modules.reduce((acc, module) => {
            acc[module] = { view: true, create: true, edit: true, approve: true, export: true, configure: true, admin: true };
            return acc;
        }, {} as ModulePermissions),
        createdAt: "2023-01-01",
    },
    {
        id: "2",
        name: "DPO",
        description: "Data Protection Officer with compliance oversight",
        isSystemRole: true,
        status: "active",
        usersCount: 3,
        permissions: modules.reduce((acc, module) => {
            acc[module] = { view: true, create: true, edit: true, approve: true, export: true, configure: false, admin: false };
            return acc;
        }, {} as ModulePermissions),
        createdAt: "2023-01-01",
    },
    {
        id: "3",
        name: "Operator",
        description: "Day-to-day operations management",
        isSystemRole: false,
        status: "active",
        usersCount: 8,
        permissions: modules.reduce((acc, module) => {
            // Operator usually manages specific tasks but doesn't configure system
            // Let's give them access to Operations group and some Main group
            const opsModules = ["Consent Management", "Rights Management", "Grievances", "Cookies Management", "Notices"];

            if (opsModules.includes(module)) {
                acc[module] = { view: true, create: true, edit: true, approve: false, export: true, configure: false, admin: false };
            } else if (module === "Dashboard") {
                acc[module] = { view: true, create: false, edit: false, approve: false, export: false, configure: false, admin: false };
            } else {
                acc[module] = { view: false, create: false, edit: false, approve: false, export: false, configure: false, admin: false };
            }
            return acc;
        }, {} as ModulePermissions),
        createdAt: "2023-03-15",
    },
    {
        id: "4",
        name: "Viewer",
        description: "Read-only access to dashboards and reports",
        isSystemRole: false,
        status: "active",
        usersCount: 12,
        permissions: modules.reduce((acc, module) => {
            acc[module] = { view: true, create: false, edit: false, approve: false, export: true, configure: false, admin: false };
            return acc;
        }, {} as ModulePermissions),
        createdAt: "2023-03-15",
    },
    {
        id: "5",
        name: "Compliance",
        description: "Compliance monitoring and reporting",
        isSystemRole: false,
        status: "active",
        usersCount: 4,
        permissions: modules.reduce((acc, module) => {
            acc[module] = { view: true, create: false, edit: false, approve: true, export: true, configure: false, admin: false };
            return acc;
        }, {} as ModulePermissions),
        createdAt: "2023-06-01",
    },
    {
        id: "6",
        name: "Auditor",
        description: "External auditor with limited access",
        isSystemRole: false,
        status: "archived",
        usersCount: 0,
        permissions: modules.reduce((acc, module) => {
            acc[module] = { view: true, create: false, edit: false, approve: false, export: true, configure: false, admin: false };
            return acc;
        }, {} as ModulePermissions),
        createdAt: "2023-04-01",
    },
];
