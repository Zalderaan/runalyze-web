import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import Link from 'next/link'
export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <header className='p-4 flex flex-row justify-start'>
                <Button asChild className='w-fit'>
                    <Link href='/'><ArrowLeft /></Link>
                </Button>
            </header>
            {children}
        </>
    )
}