'use client';

import { HistoryItem } from "@/components/history/history-item";
import { useHistory } from "@/hooks/useHistory";

// * UI IMPORTS
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Link from "next/link";
import { RunAnalysis } from "@/components/register/dashboard/home/RunAnalysis";

const sampleData = {
    thumbnail: '/run1.jpg',
    title: 'run analysis',
    date: new Date(),
    form_score: 0.9
}

export default function HistoryPage() {
    const link = "/dashboard/history"
    const { thumbnail, title, date, form_score } = sampleData;

    // get user anlyses
    const { history, isLoading, error } = useHistory();
    console.log(history);

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error Loading...</div>
    }

    if (history.length === 0) {
        return <div>No analysis yet!</div>
    }
    
    // TODO: categorize monthly

    return (
        // <>
        //     <h1 className="text-2xl font-bold mb-4">Your analyses</h1>
        //     <Accordion type="single" collapsible className="w-full">
        //         {/* //TODO: FOR LOOP, key = accordion item value=1 */}
        //         <AccordionItem value="item-1">
        //             <AccordionTrigger>This day</AccordionTrigger>
        //             <AccordionContent>
        //                 <HistoryItem
        //                     thumbnail={thumbnail}
        //                     title={title}
        //                     date={date}
        //                     form_score={form_score}
        //                 />
        //             </AccordionContent>
        //             <AccordionContent>
        //                 <HistoryItem
        //                     thumbnail={thumbnail}
        //                     title={title}
        //                     date={date}
        //                     form_score={form_score}
        //                 />
        //             </AccordionContent>
        //             <AccordionContent>
        //                 <HistoryItem
        //                     thumbnail={thumbnail}
        //                     title={title}
        //                     date={date}
        //                     form_score={form_score}
        //                 />
        //             </AccordionContent>
        //         </AccordionItem>
        //         <AccordionItem value="item-2">
        //             <AccordionTrigger>Yesterday</AccordionTrigger>
        //             <AccordionContent>
        //                 <HistoryItem
        //                     thumbnail={thumbnail}
        //                     title={title}
        //                     date={date}
        //                     form_score={form_score}
        //                 />
        //             </AccordionContent>
        //         </AccordionItem>
        //         <AccordionItem value="item-3">
        //             <AccordionTrigger>This week</AccordionTrigger>
        //             <AccordionContent>
        //                 <HistoryItem
        //                     thumbnail={thumbnail}
        //                     title={title}
        //                     date={date}
        //                     form_score={form_score}
        //                 />
        //             </AccordionContent>
        //         </AccordionItem>
        //         <AccordionItem value="item-4">
        //             <AccordionTrigger>This month</AccordionTrigger>
        //             <AccordionContent>
        //                 <HistoryItem
        //                     thumbnail={thumbnail}
        //                     title={title}
        //                     date={date}
        //                     form_score={form_score}
        //                 />
        //             </AccordionContent>
        //         </AccordionItem>
        //         <AccordionItem value="item-5">
        //             <AccordionTrigger>Older analyses</AccordionTrigger>
        //             <AccordionContent>
        //                 <HistoryItem
        //                     thumbnail={thumbnail}
        //                     title={title}
        //                     date={date}
        //                     form_score={form_score}
        //                 />
        //             </AccordionContent>
        //         </AccordionItem>
        //     </Accordion>
        //     <div>
                
        //     </div>
        // </>
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Your analyses</h1>
            <div className="flex flex-row space-x-2">
                {history.map(item => (
                    <RunAnalysis key={item.id} analysis={item}/>
                ))}
            </div>
        </div>
    );
}