import { Step0 } from '@/components/sample/step0'
import { Step1 } from '@/components/sample/step1'
import { Step2 } from '@/components/sample/step2'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SamplePage() {
    return (
        <>
            <Step0 />
            <Step1 />
            <Step2 />
        </>
    )
}