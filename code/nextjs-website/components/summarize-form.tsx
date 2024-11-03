"use client";
import {z} from "zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {SubmitButton} from "@/components/submit-button";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import VideoImageFetcher from "@/components/VideoImageFetcher";
import {useState} from "react";
import {createClient} from "@/utils/supabase/client";

const formSchema = z.object({

    videourl: z.string().min(2, {
        message: "VideoUrl must be at least 2 characters.",
    }),
})

export default function SummarizeForm() {

    const [videoImageUrl, setVideoImageUrl] = useState<string | null>(null);


    const [summary, setSummary] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videourl: "https://www.youtube.com/watch?v=4gPPpY7pHQo",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const getYouTubeVideoId = (url: string) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };


        setSummary(null);
        setLoading(true);

        setVideoImageUrl(values.videourl);


        const jsonData = {
            video_id: values.videourl,
        };

        const jsonString = JSON.stringify(jsonData);

        let data = await fetch('https://ideal-causal-halibut.ngrok-free.app/summarize', {
            method: 'POST',
            body: jsonString,
            headers: {'Content-Type': 'application/json'}
        })

        let responseData = await data.json()


        setSummary(responseData.summary)

        setLoading(false)

        const supabase = await createClient();

        const {data: user} = await supabase.auth.getUser()


        const thumbnailUrl = `https://img.youtube.com/vi/${getYouTubeVideoId(values.videourl)}/0.jpg`;

        await supabase.from("history_chat").insert({
            user_id: user.user?.id,
            summary: responseData.summary,
            video_image_url: thumbnailUrl,
            video_url: values.videourl
        }).select("*");


        await new Promise(r => setTimeout(r, 5000));
        window.location.reload();
    }

    return <div>
        {
            videoImageUrl && <VideoImageFetcher url={videoImageUrl}/>
        }
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-[500px]">

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
                {
                    loading ? <div>Loading...</div> : <SubmitButton type="submit">Submit</SubmitButton>
                }
            </form>
        </Form>

        {
            summary && <div className="border border-zinc-400 rounded-2xl p-2 mt-2">{summary}</div>
        }


    </div>
}