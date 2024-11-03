import Link from "next/link";
import { Button } from "./ui/button";
import {Plus} from "lucide-react";

export default function SummarizeButton() {
  return (
    <>
      <Link
        href="../summarize"
      >
        <Button className="flex items-center gap-2" size={"sm"}>
            <Plus />
          <span>Summarize Video</span>
        </Button>
      </Link>
    </>
  );
}
