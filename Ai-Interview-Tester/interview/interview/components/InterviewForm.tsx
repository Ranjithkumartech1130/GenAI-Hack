"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";

const interviewFormSchema = z.object({
    role: z.string().min(2, "Role is required"),
    level: z.string().min(1, "Level is required"),
    type: z.string().min(1, "Type is required"),
    techstack: z.string().min(2, "Tech stack is required"),
    amount: z.number().min(1).max(20),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

interface InterviewFormProps {
    userId: string;
}

const InterviewForm = ({ userId }: InterviewFormProps) => {
    const router = useRouter();

    const form = useForm<InterviewFormValues>({
        resolver: zodResolver(interviewFormSchema),
        defaultValues: {
            role: "",
            level: "Junior",
            type: "Mixed",
            techstack: "",
            amount: 5,
        },
    });

    const onSubmit = async (data: z.infer<typeof interviewFormSchema>) => {
        try {
            const response = await fetch("/api/interview/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    userid: userId,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Interview generated successfully!");
                router.push(`/root/interview/${result.id}`);
            } else {
                toast.error("Failed to generate interview. Please try again.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="card-border w-full max-w-2xl mx-auto">
            <div className="card p-8 sm:p-12 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-primary-100">Setup Your Mock Interview</h2>
                    <p className="text-light-100">
                        Define the role and parameters, and our AI will prepare a custom interview for you.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="role"
                                label="Job Role"
                                placeholder="e.g. Frontend Developer"
                            />

                            <div className="flex flex-col gap-3">
                                <FormLabel className="label">Experience Level</FormLabel>
                                <select
                                    {...form.register("level")}
                                    className="input w-full appearance-none bg-dark-200 text-white rounded-full px-5 py-3 outline-none cursor-pointer border-none"
                                >
                                    <option value="Junior">Junior</option>
                                    <option value="Mid-Level">Mid-Level</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Lead">Lead</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3">
                                <FormLabel className="label">Interview Type</FormLabel>
                                <select
                                    {...form.register("type")}
                                    className="input w-full appearance-none bg-dark-200 text-white rounded-full px-5 py-3 outline-none cursor-pointer border-none"
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="HR Round">HR Round (Behavioral & General)</option>
                                    <option value="Mixed">Mixed</option>
                                </select>
                            </div>

                            <FormField
                                control={form.control}
                                name="amount"
                                label="Number of Questions"
                                type="text"
                                placeholder="5"
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="techstack"
                            label="Tech Stack (comma separated)"
                            placeholder="e.g. React, TypeScript, Next.js"
                        />

                        <Button type="submit" className="btn !mt-4" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Generating..." : "Generate Interview"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default InterviewForm;
