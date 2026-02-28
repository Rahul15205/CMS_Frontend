import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


// HARDCODED CREDENTIALS
const USERNAME = "admin";
const PASSWORD = "Consent@2024";

interface SimpleAuthProps {
    children: React.ReactNode;
}

const SimpleAuth: React.FC<SimpleAuthProps> = ({ children }) => {
    const { isAuthenticated, login, roles } = useAuth();
    const [loading, setLoading] = useState(true);
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState(roles.length > 0 ? roles[0].id : "");

    useEffect(() => {
        // Set default role if available and not set
        if (!selectedRoleId && roles.length > 0) {
            setSelectedRoleId(roles[0].id);
        }
        setLoading(false);
    }, [roles]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, role would be returned from backend after auth
        // Here we simulate picking a role to login as
        if (inputUsername === USERNAME && inputPassword === PASSWORD) {
            login(inputUsername, selectedRoleId);
            toast.success("Authentication successful");
        } else {
            toast.error("Invalid credentials");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Restricted Access</CardTitle>
                    <p className="text-sm text-gray-500">Please enter your credentials to continue</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter username"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter password"
                                value={inputPassword}
                                onChange={(e) => setInputPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Login As (Role Simulation)</Label>
                            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                                <SelectTrigger>
                                    <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.filter(r => r.status === 'active').map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Select a role to visualize different access levels.</p>
                        </div>

                        <Button type="submit" className="w-full">
                            Access System
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                    <p className="text-xs text-gray-400">Consent Management System • Secure Login</p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SimpleAuth;
