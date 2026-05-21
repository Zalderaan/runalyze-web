'use client'

import { useState } from "react";
import { useDrillTemplates, type DrillTemplate } from "@/hooks/drills/use-drill-templates";
import { TemplateCard } from "@/components/admin/TemplateCard";
import { TemplateDetailSheet } from "@/components/admin/TemplateDetailSheet";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";

export function TemplatesList() {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<DrillTemplate | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { templates, templatesLoading, templatesError, refetch } = useDrillTemplates(search);

    function handleCardClick(template: DrillTemplate) {
        setSelected(template);
        setSheetOpen(true);
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search templates by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-primary h-11"
                />
            </div>

            {/* Grid */}
            {templatesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[250px] rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : templatesError ? (
                <div className="p-4 text-red-600">Error: {templatesError}</div>
            ) : templates.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                    <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-300">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <p className="font-medium">No templates found</p>
                    <p className="text-sm opacity-70">Try adjusting your search term</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onClick={handleCardClick}
                        />
                    ))}
                </div>
            )}

            {/* Detail sheet */}
            <TemplateDetailSheet
                template={selected}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onTemplateUpdated={(updatedTemplate) => {
                    // Refresh the template grid
                    refetch();
                    // If we got the updated template object, update `selected` in-place
                    if (updatedTemplate) {
                        setSelected(updatedTemplate);
                    }
                }}
                onTemplateDeleted={() => {
                    refetch();
                    setSheetOpen(false);
                    setSelected(null);
                }}
            />
        </div>
    );
}
