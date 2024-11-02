import Image from "next/image";
import SummarizeForm from "@/components/summarize-form";
import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";

export default async function SummarizePage() {

    const supabase = await createClient();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeVideoId("https://www.youtube.com/watch?v=4gPPpY7pHQo");

    if (!videoId) {
        return <div>Invalid YouTube URL</div>;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;


    return <div>

        <Image
            src={thumbnailUrl}
            alt="YouTube video thumbnail"
            width={280}
            height={360}
            className="justify-self-center"
        />

        <SummarizeForm/>

    </div>
}