import { useEffect, useState } from "react";

export default function PublicPosts() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE;
    console.log(base);
    alert(base);
    const url = `${base}/stories/public`;

    let mounted = true;
    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // backend returns { success: true, stories }
        setStories(data.stories || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to fetch");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-300">Loading public posts...</div>
    );
  if (error)
    return <div className="text-center text-red-500">Error: {error}</div>;

  if (!stories.length)
    return (
      <div className="text-center text-gray-400">No public posts yet.</div>
    );

  return (
    <div className="space-y-6">
      {stories.map((s) => (
        <div
          key={s._id}
          className="bg-zinc-900 border border-zinc-800 p-4 rounded"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">
              By:{" "}
              {s.author?.username ||
                s.author?.email ||
                s.author?.id ||
                "Unknown"}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(s.createdAt).toLocaleString()}
            </div>
          </div>

          {s.images && s.images.length > 0 && (
            <img
              src={s.images[0].url}
              alt="story"
              className="w-full h-auto rounded mb-3"
            />
          )}

          <div className="flex gap-4 text-sm text-gray-300">
            <div>Upvotes: {s.upvotes ?? 0}</div>
            <div>Downvotes: {s.downvotes ?? 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
