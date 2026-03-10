import Link from "next/link";
import { getFeedPosts } from "@/lib/queries";
export const dynamic = "force-dynamic";
export default function FeedPage() {
  const posts = getFeedPosts();
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Mike V&apos;s Feed</h1>
        <p className="text-gray-400 text-sm mt-1">HVU Insider Intel &middot; Scout. Score. Win.</p>
      </div>
      {/* HVU Insider Banner */}
      <div className="nittany-gradient rounded-xl p-4 border border-psu-gold/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-psu-navy font-black text-sm">MV</div>
          <div>
            <div className="font-bold text-white text-sm">Coach Mike V</div>
            <div className="text-[10px] text-psu-gold">HVU Insider &middot; @HappyValleyUnited</div>
          </div>
        </div>
        <p className="text-sm text-psu-steel mt-3">Follow this feed for 1st-to-market recruiting intel, training reports, and insider challenges. Every engagement earns you XP toward exclusive Penn State experiences.</p>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-psu-navy font-bold text-xs">MV</div>
              <div>
                <div className="text-sm font-medium">{post.author}</div>
                <div className="text-[10px] text-gray-500">{post.created_at}</div>
              </div>
              <span className="badge-gold ml-auto">{post.post_type === "intel" ? "INTEL DROP" : post.post_type === "challenge" ? "CHALLENGE" : post.post_type === "commit" ? "COMMIT ALERT" : "UPDATE"}</span>
            </div>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{post.content}</p>
            {post.player_name && (
              <Link href={`/players/${post.player_id}`} className="inline-flex items-center gap-2 mt-3 text-psu-accent text-sm hover:underline">
                View {post.player_name}&apos;s Profile &rarr;
              </Link>
            )}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-psu-light/10 text-xs text-gray-500">
              <span>{post.likes_count} likes</span>
              <span>{post.shares_count} shares</span>
              <span className="text-psu-gold ml-auto">+25 XP for engaging</span>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="text-center py-12 text-gray-500">No posts yet. Check back soon!</div>}
      </div>
    </div>
  );
}
