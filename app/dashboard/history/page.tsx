'use client';

import { HistoryItem } from "@/components/history/history-item";
import { useHistory } from "@/hooks/useHistory";

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
            {history.map(item => (
                <HistoryItem 
                    key={item.id}
                    thumbnail={`${thumbnail}`}
                    title={`${new Date(item.created_at).toLocaleDateString()}`}
                    date={new Date(item.created_at)}
                    form_score={`${Number(item.overall_score.toFixed(0))}%`}             
                />
            ))}
        </div>
    );
}