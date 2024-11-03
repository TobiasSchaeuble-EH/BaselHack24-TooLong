import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export default async function HistoryLoader() {
    const supabase = await createClient();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const test = await supabase.from("history_chat").select("*").eq("user_id", user.id).order("created_at", {ascending: false});


    return <div>{test.data?.map((value) => <Link href={`summarize/${value.id}`}><Button variant="link"
                                                                                        key={value.id}>
        <div className="flex justify-center items-center gap-2"><Image
            src={value.video_image_url}
            alt={"video url"}
            width={50}
            height={50}/> {value.video_url}</div>
    </Button></Link>)}</div>
}