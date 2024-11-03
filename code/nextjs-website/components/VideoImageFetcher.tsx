import Image from "next/image";

interface Props{
    url: string
}

export default function VideoImageFetcher(
    {
        url
    }: Props
) {
    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeVideoId(url);

    if (!videoId) {
        return <div>Invalid YouTube URL</div>;
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;


    return <Image
        src={thumbnailUrl}
        alt="YouTube video thumbnail"
        width={280}
        height={360}
        className="justify-self-center"
    />
}