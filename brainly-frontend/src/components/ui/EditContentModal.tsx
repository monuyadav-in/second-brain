import { useState, useEffect } from "react";
import { Button } from "./Button";
import type { ContentType } from "../../hooks/useContent";

export interface EditableContentItem {
    id: string;
    title: string;
    link: string;
    type: ContentType;
    tags?: string[];
}

interface EditContentModalProps {
    open: boolean;
    content: EditableContentItem | null;
    onClose: () => void;
    onSubmit: (id: string, updated: { title: string; link: string; type: ContentType; tags: string[] }) => Promise<void> | void;
}

const TYPE_OPTIONS: { value: ContentType; label: string; emoji: string }[] = [
    { value: "YouTube", label: "YouTube", emoji: "▶️" },
    { value: "Twitter", label: "Twitter / X", emoji: "𝕏" },
    { value: "Document", label: "Document", emoji: "📄" },
    { value: "Link", label: "Link", emoji: "🔗" },
];

export function EditContentModal({ open, content, onClose, onSubmit }: EditContentModalProps) {
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [type, setType] = useState<ContentType>("YouTube");
    const [tags, setTags] = useState("");
    const [saving, setSaving] = useState(false);

    // Populate existing values when modal opens or content changes
    useEffect(() => {
        if (content && open) {
            setTitle(content.title || "");
            setLink(content.link || "");
            setType(content.type || "Link");
            setTags(Array.isArray(content.tags) ? content.tags.join(", ") : "");
        }
    }, [content, open]);

    if (!open || !content) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content) return;

        setSaving(true);
        const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);

        try {
            await onSubmit(content.id, {
                title: title.trim(),
                link: link.trim(),
                type,
                tags: tagList,
            });
            onClose();
        } catch (err) {
            console.error("Error updating content:", err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">Edit Content</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                                {type}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer rounded-full p-1 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
                        {/* Title */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 100 Days of Code"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                            />
                        </div>

                        {/* Link */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Link <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                required
                                placeholder="https://..."
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                            />
                        </div>

                        {/* Type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {TYPE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setType(opt.value)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition cursor-pointer ${
                                            type === opt.value
                                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                                : "border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50"
                                        }`}
                                    >
                                        <span>{opt.emoji}</span>
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Tags
                                <span className="text-xs font-normal text-gray-400 ml-1">
                                    (comma separated)
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. productivity, coding, ideas"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                            />
                            {tags && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {tags
                                        .split(",")
                                        .map((t) => t.trim())
                                        .filter(Boolean)
                                        .map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full font-medium"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={saving}
                                text={saving ? "Saving..." : "Save Changes"}
                                className="flex-1"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditContentModal;
