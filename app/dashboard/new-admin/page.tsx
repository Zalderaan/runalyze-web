import { UserTable } from "@/components/add-admin/UserTable"

export default function NewAdmin() {


    return (
        <>
            <div className="flex flex-col space-y-2">
                <UserTable />
            </div>
        </>
    )
    // 1. show a list of existing users
    // -- a. It would be good to have a search functionality

    // 2. Add a "Make admin" button for each user

    // 3. onClick --> dialog confirmation "Make user <username> an admin?"
}