import {createClient} from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ videoId: string }>
}) {

    const supabase = await createClient();

    const videoId = (await params).videoId
    const data = await supabase.from("history_chat").select("*").eq("id", videoId).single();

    return <div className="gap-8 justify-center items-center grid">

        <Link href={"../summarize"}><Button variant={"link"}>Zurück</Button></Link>
        <Image src={data.data.video_image_url} alt={"Image of the Video"} width={200} height={200}/>
        <div>{data.data.video_url}</div>
        <div>{data.data.summary}</div>
    </div>
}