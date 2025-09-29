import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type searchInputProps = {
    value: string,
    onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: searchInputProps) {
    return (
        <>
            <div className="flex flex-row items-center justify-between space-x-2">
                <Search />
                <Input
                    type="text"
                    placeholder="Search drills..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </>
    )
}