"use client";
import {z} from "zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {SubmitButton} from "@/components/submit-button";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const formSchema = z.object({
    apikey: z.string().min(2, {
        message: "Apikey must be at least 2 characters.",
    }),
    videourl: z.string().min(2, {
        message: "VideoUrl must be at least 2 characters.",
    }),
})

export default function SummarizeForm() {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            apikey: "SUPER SECRET KEY",
            videourl: "https://www.youtube.com/watch?v=4gPPpY7pHQo",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)

        const jsonData = {
            title: "My Blog Post",
            content: "This is the content of my blog post.",
        };

        const jsonString = JSON.stringify(jsonData);


        const response = new Response(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // let datssa = await fetch('https://api.vercel.app/blog', {method: 'POST', body: jsonString, headers: {'Content-Type': 'application/json'}})
        let data = response;
        let responseData = await data.json()

        console.log("data", responseData)
    }

    return <div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-[500px]">
                <FormField

                    control={form.control}
                    name="apikey"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>GPT Token</FormLabel>
                            <FormControl>
                                <Input placeholder="Super Secret API Key" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your super secret api key.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField

                    control={form.control}
                    name="videourl"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>VideoURL</FormLabel>
                            <FormControl>
                                <Input placeholder="VideoURL" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the VideoURL you want to summarize.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <SubmitButton type="submit">Submit</SubmitButton>
            </form>
        </Form>
    </div>
}