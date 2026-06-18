import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Upload, Link as LinkIcon, FileVideo } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export function SubmitPage() {
  const { user, token } = useAuth();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return (
    <PageShell>
      <div className="min-h-[60vh] grid place-items-center text-center">
        <div>
          <Upload className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in required</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to submit videos.</p>
          <button onClick={() => navigate("/auth")} className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
            Sign in
          </button>
        </div>
      </div>
    </PageShell>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/videos/submit", {
        method: "POST",
        body: JSON.stringify({ title, embed_code: embedCode, description, thumbnail_url: thumbnailUrl }),
      }, token);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="container-px mx-auto max-w-[1600px]">
        <div className="max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1 text-accent">Create</div>
          <h1 className="font-display text-3xl font-black mb-8">Submit a Video</h1>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl p-8 text-center"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-display text-2xl font-bold mb-2">Submitted!</h2>
              <p className="text-muted-foreground mb-6">Your video is pending review and will appear once approved.</p>
              <button
                onClick={() => { setSuccess(false); setTitle(""); setEmbedCode(""); setDescription(""); setThumbnailUrl(""); }}
                className="px-6 py-2 rounded-full glass border border-white/10 font-semibold text-sm hover:bg-white/10 transition"
              >
                Submit another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="glass rounded-3xl p-8 space-y-6 border border-white/10">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  <FileVideo className="inline h-3.5 w-3.5 mr-1" /> Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  placeholder="Video title"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  <LinkIcon className="inline h-3.5 w-3.5 mr-1" /> Embed Code or URL *
                </label>
                <textarea
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                  placeholder={'<iframe src="https://www.eporner.com/embed/abc123" ...></iframe>'}
                />
                <p className="text-xs text-muted-foreground mt-1">Paste an embed code from Eporner, Pornhub, or Redtube</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Thumbnail URL</label>
                <input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  type="url"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                  placeholder="https://example.com/thumb.jpg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                  placeholder="Optional description…"
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 shadow-glow flex items-center justify-center gap-2"
              >
                {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Upload className="h-4 w-4" />}
                Submit for Review
              </button>
            </form>
          )}
        </div>

        <div className="h-24" />
      </div>
    </PageShell>
  );
}
