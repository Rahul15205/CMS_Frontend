import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="border-t border-border bg-background/50 py-6 px-6 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Proteccio data. All rights reserved.
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Privacy Notice
                    </Link>
                    <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Terms of Use
                    </Link>
                </div>
            </div>
        </footer>
    );
}
