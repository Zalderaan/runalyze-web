import { TermsContent } from '@/components/legal/terms-content';
import { LandingHeader } from '@/components/landing/landing-header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use - Runalyze',
    description: 'Terms of Use and legal disclaimer for the Runalyze running analysis platform.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <LandingHeader />

            <main className="container mx-auto px-4 py-12 max-w-3xl">
                {/* Page header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Terms of Use
                    </h1>
                    <p className="text-sm text-slate-400">Last updated: May 2025</p>
                    <p className="mt-4 text-sm text-slate-600 max-w-2xl leading-relaxed">
                        Please read these terms carefully before using Runalyze. By creating an account
                        or using our platform, you agree to be bound by the terms below.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 mb-10" />

                {/* Terms content */}
                <TermsContent />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
                <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
                    <p>&copy; 2025 Runalyze. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
