import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function MainLayout() {
    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <Outlet />
        </div>
    );
}
