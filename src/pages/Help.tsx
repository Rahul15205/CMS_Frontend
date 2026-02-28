import { useState } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Search,
    Book,
    FileText,
    Shield,
    Settings,
    Users,
    MessageCircle,
    LifeBuoy,
    Mail,
    ExternalLink,
    ChevronRight
} from "lucide-react";

export default function Help() {
    const [searchQuery, setSearchQuery] = useState("");

    const modules = [
        {
            title: "Consent Management",
            icon: <FileText className="h-6 w-6 text-primary" />,
            description: "Manage consent templates, track user consents, and handle renewals.",
            links: ["Creating a Consent Template", "Viewing Consent Records", "Consent Renewal Process"]
        },
        {
            title: "Rights Management",
            icon: <Shield className="h-6 w-6 text-primary" />,
            description: "Process data subject rights requests (DSARs) like access, deletion, and rectification.",
            links: ["Handling Access Requests", "Processing Deletions", "SLA Monitoring"]
        },
        {
            title: "Notices & Policies",
            icon: <Book className="h-6 w-6 text-primary" />,
            description: "Create and manage privacy notices, terms of service, and cookie policies.",
            links: ["Versioning Notices", "Multi-language Support", "Publishing Policies"]
        },
        {
            title: "Configurations",
            icon: <Settings className="h-6 w-6 text-primary" />,
            description: "System-wide settings, integrations, and compliance rules.",
            links: ["API Integrations", "Workflow Configuration", "Audit Logs"]
        },
        {
            title: "User Management",
            icon: <Users className="h-6 w-6 text-primary" />,
            description: "Manage administrative users, roles, and access permissions.",
            links: ["Creating Users", "Role-Based Access Control", "Activity Monitoring"]
        }
    ];

    const faqs = [
        {
            question: "How do I reset a user's password?",
            answer: "Go to the User Setup module, find the user in the list, click the 'Edit' action, and select 'Reset Password'. An email will be sent to the user with instructions."
        },
        {
            question: "What happens when a consent expires?",
            answer: "When a consent expires, the system automatically flags it as 'Expired'. Depending on your configuration, a renewal notification can be sent to the data principal automatically."
        },
        {
            question: "How can I export the audit logs?",
            answer: "Navigate to the 'Logs' section. Use the date filters to select the desired range, then click the 'Export' button at the top right to download a CSV or PDF report."
        },
        {
            question: "Can I customize the dashboard widgets?",
            answer: "Yes! Click the 'Customize' button on the top right of the Dashboard to show/hide widgets and rearrange them according to your preference."
        },
        {
            question: "How do I add a new language for notices?",
            answer: "In the Notices module, go to the 'Localization' tab. Click 'Add Language' and select the desired language from the list. You will then need to provide translations for your active notices."
        }
    ];

    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.links.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <DashboardLayout title="Help Center">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Search Header */}
                <div className="relative bg-primary/5 rounded-2xl p-8 text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">How can we help you today?</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Search our knowledge base for guides, tutorials, and answers to common questions about the Consent Management System.
                    </p>
                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for help..."
                            className="pl-10 h-12 bg-background shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Quick Help Tabs */}
                <Tabs defaultValue="modules" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto">
                        <TabsTrigger value="modules">Modules</TabsTrigger>
                        <TabsTrigger value="faqs">FAQs</TabsTrigger>
                        <TabsTrigger value="support">Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="modules" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModules.map((module, index) => (
                                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary">
                                    <CardHeader>
                                        <div className="mb-2 p-2 w-fit rounded-lg bg-primary/10">
                                            {module.icon}
                                        </div>
                                        <CardTitle className="text-xl">{module.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {module.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {module.links.map((link, i) => (
                                                <li key={i} className="flex items-center text-sm text-primary hover:underline">
                                                    <ChevronRight className="h-3 w-3 mr-1" />
                                                    {link}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="faqs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Frequently Asked Questions</CardTitle>
                                <CardDescription>
                                    Common questions and answers about using the system.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-left font-medium">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="support">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LifeBuoy className="h-5 w-5" />
                                        Contact Support
                                    </CardTitle>
                                    <CardDescription>
                                        Need personal assistance? Our support team is here to help.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                                        <Mail className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Email Support</p>
                                            <p className="text-sm text-muted-foreground">support@consent-manager.com</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="ml-auto">Copy</Button>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">Live Chat</p>
                                            <p className="text-sm text-muted-foreground">Available Mon-Fri, 9am-6pm</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="ml-auto">Start Chat</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Book className="h-5 w-5" />
                                        Documentation
                                    </CardTitle>
                                    <CardDescription>
                                        In-depth guides and technical documentation.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button variant="outline" className="w-full justify-between" asChild>
                                        <a href="#" target="_blank" rel="noopener noreferrer">
                                            User Guide (PDF)
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-between" asChild>
                                        <a href="#" target="_blank" rel="noopener noreferrer">
                                            API Reference
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-between" asChild>
                                        <a href="#" target="_blank" rel="noopener noreferrer">
                                            Compliance Best Practices
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
