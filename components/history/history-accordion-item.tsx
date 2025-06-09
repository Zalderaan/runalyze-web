'use client'

import { HistoryItem } from '@/components/history/history-item'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';


export interface HistoryAccordionItemProps {
    value: number,
}

export function HistoryAccordionItem() {
    return (
        <AccordionItem value=''>

        </AccordionItem>
    );
}