import Image from "next/image";
import imageSRC from "./image.png"
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Plus} from "lucide-react";

export default async function Index() {
    return (
        <>
            <main className="flex-1 flex flex-col gap-6 px-4 justify-center items-center">

                <Image src={imageSRC} alt={"Deadly Subscription Image"} width={200} height={200}
                       className={"rounded-2xl"}/>

                <h1 className="font-medium text-6xl mb-4">Welcome <span className={"font-bold"}>To</span>oLong! </h1>
                <div className="text-4xl text-center">The new Bot for summarizing Videos <span
                    className="font-bold">WITHOUT </span>
                    a <span className="font-bold">DEADLY</span> subscription.
                </div>

                <div className="text-2xl mt-5">Please first Sign Up and then you can start SUMMARIZING</div>

                <div className={"flex gap-4"}>

                    <Link
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://www.google.de"
                    >
                        <Button className="flex items-center gap-2">
                            <span>Telegram</span>
                        </Button>
                    </Link>

                    <Link
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://www.google.de"
                    >
                        <Button className="flex items-center gap-2">
                            <span>Discord</span>
                        </Button>
                    </Link>

                    <Link
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://www.google.de"
                    >
                        <Button className="flex items-center gap-2">
                            <span>Chrome WebStore</span>
                        </Button>
                    </Link>
                </div>
            </main>
        </>
    );
}
