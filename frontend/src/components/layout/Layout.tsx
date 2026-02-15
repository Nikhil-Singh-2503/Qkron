import { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
    showHeader?: boolean;
    showFooter?: boolean;
}

export default function Layout({
    children,
    showHeader = true,
    showFooter = true
}: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            {showHeader && <Header />}
            <main className="flex-1">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
}
