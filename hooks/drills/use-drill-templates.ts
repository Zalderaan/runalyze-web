'use client'

import { useEffect, useState } from "react";

export interface DrillTemplate {
    id: number;
    name: string;
    video_url: string | null;
    instructions: { steps: Array<string> } | null;
    justification: string | null;
    reference: string | null;
    helpful_count: number;
    not_helpful_count: number;
    created_at: string;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function useDrillTemplates(searchTerm = "") {
    const [templates, setTemplates] = useState<DrillTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [templatesError, setTemplatesError] = useState<string | null>(null);

    useEffect(() => {
        fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    async function fetchTemplates() {
        setTemplatesLoading(true);
        setTemplatesError(null);
        try {
            const params = new URLSearchParams({ search: searchTerm });
            const res = await fetch(`/api/admin/drill-templates?${params}`);
            if (!res.ok) {
                throw new Error("Failed to fetch templates");
            }
            const { templates } = await res.json();
            setTemplates(templates ?? []);
        } catch (err) {
            setTemplatesError("Failed to fetch drill templates");
            console.error(err);
        } finally {
            setTemplatesLoading(false);
        }
    }

    return {
        templates,
        templatesLoading,
        templatesError,
        refetch: fetchTemplates,
    };
}
