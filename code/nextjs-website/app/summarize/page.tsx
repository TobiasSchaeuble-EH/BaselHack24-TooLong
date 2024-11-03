import SummarizeForm from "@/components/summarize-form";
import HistoryLoader from "@/components/HistoryLoader";


export default async function SummarizePage() {

    return <div className="flex">
        <HistoryLoader/>
        <SummarizeForm/>
    </div>
}