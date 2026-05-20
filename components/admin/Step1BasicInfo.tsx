'use client'

import { useState } from "react";
import { useFormContext } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useDrillTemplates, type DrillTemplate } from "@/hooks/drills/use-drill-templates";
import { Check, ChevronsUpDown, Library, Plus } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step1BasicInfoProps {
    onTemplateSelected?: (template: DrillTemplate | null) => void;
    isTemplateMode?: boolean;
    fixedTemplate?: DrillTemplate;
    isEditMode?: boolean;
    initialTemplate?: { id: number, name: string } | null;
}

export function Step1BasicInfo({ onTemplateSelected, isTemplateMode = false, fixedTemplate, isEditMode = false, initialTemplate }: Step1BasicInfoProps) {
    const { control, setValue, watch } = useFormContext();
    const [useExisting, setUseExisting] = useState(isEditMode || !!fixedTemplate);
    const [open, setOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(fixedTemplate || initialTemplate || null);
    const [templateSearch, setTemplateSearch] = useState("");

    const { templates, templatesLoading } = useDrillTemplates(templateSearch);
    const selectedTemplateId = watch("template_id");

    function handleTemplateSelect(template: DrillTemplate) {
        setSelectedTemplate(template);
        setValue("template_id", template.id);
        setValue("drill_name", template.name);
        setOpen(false);
        onTemplateSelected?.(template);
    }

    function handleToggleMode(checked: boolean) {
        if (fixedTemplate) return;
        setUseExisting(checked);
        if (!checked) {
            // Clear template selection when switching back to "New"
            setSelectedTemplate(null);
            setValue("template_id", undefined);
            setValue("drill_name", "");
            onTemplateSelected?.(null);
        }
    }

    return (
        <div className="space-y-4">
            {/* Toggle: New vs Existing */}
            {!isTemplateMode && !fixedTemplate && !isEditMode && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="use-existing" className="text-sm text-muted-foreground cursor-pointer">New Drill</Label>
                </div>
                <Switch
                    id="use-existing"
                    checked={useExisting}
                    onCheckedChange={handleToggleMode}
                />
                <div className="flex items-center gap-2">
                    <Library className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="use-existing" className="text-sm text-muted-foreground cursor-pointer">Use Existing Template</Label>
                </div>
            </div>
            )}

            {/* Template Selector (when using existing) */}
            {!isTemplateMode && useExisting ? (
                <FormItem>
                    <FormLabel>Drill Template</FormLabel>
                    <FormDescription className="text-xs">
                        {fixedTemplate ? "This assignment will be linked to this template." : "Choose from your existing drill library."}
                    </FormDescription>
                    
                    {fixedTemplate ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                            <Library className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{fixedTemplate.name}</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto">Fixed Template</Badge>
                        </div>
                    ) : (
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {selectedTemplate ? (
                                        <span className="flex items-center gap-2">
                                            {selectedTemplate.name}
                                            <Badge variant="secondary" className="text-xs">Template</Badge>
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">Search drill templates...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Search templates..."
                                        value={templateSearch}
                                        onValueChange={setTemplateSearch}
                                    />
                                    <CommandList>
                                        {templatesLoading ? (
                                            <div className="py-6 text-center text-sm text-muted-foreground">Loading templates...</div>
                                        ) : (
                                            <>
                                                <CommandEmpty>No templates found.</CommandEmpty>
                                                <CommandGroup heading="Drill Library">
                                                    {templates.map((template) => (
                                                        <CommandItem
                                                            key={template.id}
                                                            value={template.name}
                                                            onSelect={() => handleTemplateSelect(template)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedTemplateId === template.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {template.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* Hidden field to register template_id */}
                    <FormField
                        control={control}
                        name="template_id"
                        render={() => <input type="hidden" />}
                    />
                    <FormField
                        control={control}
                        name="drill_name"
                        render={() => <input type="hidden" />}
                    />
                </FormItem>
            ) : (
                /* New drill name input */
                <FormField
                    control={control}
                    name="drill_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Drill Name</FormLabel>
                            <FormDescription className="text-xs">Name of the drill or exercise.</FormDescription>
                            <FormControl>
                                <Input placeholder="ex. A-Skips" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />
            )}

            {!isTemplateMode && (
                <>
                    <FormField
                        control={control}
                        name="area"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormDescription className="text-xs">Body area or aspect being targeted.</FormDescription>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="head_position">Head Position</SelectItem>
                                    <SelectItem value="back_position">Back Position</SelectItem>
                                    <SelectItem value="arm_flexion">Arm Flexion</SelectItem>
                                    <SelectItem value="right_knee">Right Knee</SelectItem>
                                    <SelectItem value="left_knee">Left Knee</SelectItem>
                                    <SelectItem value="foot_strike">Foot Strike</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="performance_level"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Performance Level</FormLabel>
                        <FormDescription className="text-xs">Current performance level of the athlete.</FormDescription>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select athlete's performance level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="poor">Poor</SelectItem>
                                    <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="excellent">Excellent</SelectItem>
                                </SelectContent>


                            </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />
            </>
            )}
        </div>
    )
}