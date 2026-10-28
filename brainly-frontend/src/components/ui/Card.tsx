import { useEffect } from "react";
import { ShareIcon } from "../../icons/shareIcons";
import { DeleteIcon } from "../../icons/deleteIcons";
import { EditIcon } from "../../icons/editIcons";
import { DocumentIcon } from "../../icons/documentIcons";
import { LinkIcon } from "../../icons/linkIcons";

type ContentType = "YouTube" | "Twitter" | "Document" | "Link";

export interface CardProps {
    type: ContentType;
    title: string;
    link: string;
    tags?: string[];
    onShare?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

function getYouTubeEmbedUrl(url: string): string {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;

    return url;
}

// Injects twitter widgets.js once globally
function loadTwitterScript() {
    if (document.getElementById("twitter-wjs")) return;
    const script = document.createElement("script");
    script.id = "twitter-wjs";
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
}

function TypeIcon({ type }: { type: ContentType }) {
    if (type === "YouTube") {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-5 fill-red-500 shrink-0"
            >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        );
    }

    if (type === "Twitter") {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-5 fill-black shrink-0"
            >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.256 5.647 5.908-5.647Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        );
    }

    if (type === "Document") {
        return <DocumentIcon size="sm" className="text-purple-600 shrink-0" />;
    }

    return <LinkIcon size="sm" className="text-blue-500 shrink-0" />;
}

function TwitterEmbed({ link }: { link: string }) {
    useEffect(() => {
        loadTwitterScript();
        const win = window as unknown as { twttr?: { widgets?: { load: () => void } } };
        if (win.twttr?.widgets) {
            win.twttr.widgets.load();
        }
    }, [link]);

    return (
        <div className="w-full">
            <blockquote className="twitter-tweet" data-theme="light">
                <a href={link.split("?")[0]}>View Tweet</a>
            </blockquote>
        </div>
    );
}

export function Card({ type, title, link, tags = [], onShare, onEdit, onDelete }: CardProps) {
    const isYouTube = type === "YouTube";
    const isTwitter = type === "Twitter";
    const isDocument = type === "Document";
    const isLink = type === "Link";

    return (
        <div className="w-full h-[380px] bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-50 bg-white">
                <div className="flex items-center gap-2">
                    <TypeIcon type={type} />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {type}
                    </span>
                </div>

                {/* Action buttons (Share, Edit, Delete) */}
                <div className="flex items-center gap-1 text-gray-400">
                    <button
                        type="button"
                        onClick={onShare}
                        className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                        title="Share link"
                        aria-label="Share link"
                    >
                        <ShareIcon size="sm" />
                    </button>
                    {onEdit && (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="p-1 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                            title="Edit card"
                            aria-label="Edit card"
                        >
                            <EditIcon size="sm" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onDelete}
                        className="p-1 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete note"
                        aria-label="Delete note"
                    >
                        <DeleteIcon size="sm" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content Body with Fixed Card Height */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
                {/* Title */}
                <h2 className="text-base font-bold text-gray-900 leading-snug break-words">
                    {title}
                </h2>

                {/* YouTube embed */}
                {isYouTube && (
                    <div className="w-full aspect-video bg-black/5 rounded-xl overflow-hidden shrink-0">
                        <iframe
                            className="w-full h-full"
                            src={getYouTubeEmbedUrl(link)}
                            title={title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Twitter embed */}
                {isTwitter && <TwitterEmbed link={link} />}

                {/* Document preview */}
                {isDocument && (
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-gray-600 space-y-2">
                        <p className="break-words">
                            {link ? `Source: ${link}` : "No link provided for this document."}
                        </p>
                        {link && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-semibold text-purple-700 hover:text-purple-900 underline"
                            >
                                Open Document &rarr;
                            </a>
                        )}
                    </div>
                )}

                {/* Link preview */}
                {isLink && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1.5">
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="block font-medium text-blue-700 hover:text-blue-900 break-all"
                        >
                            {link}
                        </a>
                        <span className="text-[11px] text-gray-500 block">External reference</span>
                    </div>
                )}

                {/* Tags if present */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}