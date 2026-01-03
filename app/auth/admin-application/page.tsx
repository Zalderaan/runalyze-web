import { AdminApplyForm } from "@/components/admin-apply/admin-apply-form";

export default function AdminApplicationAuthPage() {
    return (
        <>
            <div className="flex-1 flex flex-col gap-4 h-full w-full justify-center items-center p-4">
                <AdminApplyForm />
            </div>
        </>
    )
}