import { AdminTable } from "@/components/add-admin/AdminsTable"
import { ApplicationsTable } from "@/components/add-admin/ApplicationsTable"
import { RoleGuard } from "@/components/RoleGuard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function NewAdmin() {
    return (
        <RoleGuard allowedRoles={["owner"]}>
            <div className="flex flex-col space-y-6 w-full">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
                    <p className="text-gray-500">Manage admins and review applications</p>
                </div>

                <Tabs defaultValue="admins" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="admins">Admins</TabsTrigger>
                        <TabsTrigger value="applicants">Applicants</TabsTrigger>
                    </TabsList>

                    <TabsContent value="admins" className="w-full mt-6">
                        <AdminTable />
                    </TabsContent>

                    <TabsContent value="applicants" className="w-full mt-6">
                        <ApplicationsTable />
                    </TabsContent>
                </Tabs>
            </div>
        </RoleGuard>
    )
}