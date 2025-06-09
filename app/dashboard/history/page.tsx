'use client';

import { HistoryItem } from "@/components/history/history-item";
// * UI IMPORTS
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const sampleData = {
    thumbnail: '/run1.jpg',
    title: 'run analysis',
    date: new Date(),
    form_score: 0.9
}

export default function HistoryPage() {
    const { thumbnail, title, date, form_score } = sampleData;

    // TODO: get user analyses
    // * const analyses = fetch(==get all history endpoint==)
    return (
        <>
            <Accordion type="single" collapsible className="w-full">
                {/* //TODO: FOR LOOP, key = accordion item value=1 */}
                <AccordionItem value="item-1">
                    <AccordionTrigger>This day</AccordionTrigger>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Yesterday</AccordionTrigger>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>This week</AccordionTrigger>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>This month</AccordionTrigger>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger>Older analyses</AccordionTrigger>
                    <AccordionContent>
                        <HistoryItem
                            thumbnail={thumbnail}
                            title={title}
                            date={date}
                            form_score={form_score}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
}