import Link from "next/link";
import { getFeedPosts } from "@/lib/queries";
export const dynamic = "force-dynamic";
export default function FeedPage() {
  const posts = getFeedPosts();
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">neXT Feed</h1>
        <p className="text-gray-400 text-sm mt-1">Intel, race recaps, signings &middot; RISE+ points for engaging</p>
      </div>
      <div className="haas-gradient rounded-xl p-4 border border-haas-red/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-haas-red flex items-center justify-center text-white font-black text-[10px]">neXT</div>
          <div>
            <div className="font-bold text-white text-sm">Haas neXT | Alpine neXT</div>
            <div className="text-[10px] text-alpine-pink">RISE+ | Discover the next F1 stars</div>
          </div>
        </div>
        <p className="text-sm text-haas-silver mt-3">Follow this feed for driver intel, race recaps, market moves, and fan vote updates. Every engagement earns RISE+ points toward VIP F1 experiences.</p>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${post.team_context === "alpine" ? "bg-alpine-blue text-white" : "bg-haas-red text-white"}`}>
                {post.team_context === "alpine" ? "A" : "H"}
              </div>
              <div>
                <div className="text-sm font-medium">{post.author}</div>
                <div className="text-[10px] text-gray-500">{post.created_at}</div>
              </div>
              <span className={`ml-auto badge ${post.post_type === "intel" ? "badge-red" : post.post_type === "race_recap" ? "badge-blue" : post.post_type === "signing" ? "bg-green-500/20 text-green-400" : post.post_type === "vote" ? "badge-pink" : "badge-white"}`}>
                {post.post_type === "intel" ? "INTEL" : post.post_type === "race_recap" ? "RACE RECAP" : post.post_type === "signing" ? "SIGNING" : post.post_type === "vote" ? "VOTE UPDATE" : "UPDATE"}
              </span>
            </div>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{post.content}</p>
            {post.driver_name && (
              <Link href={`/drivers/${post.driver_id}`} className="inline-flex items-center gap-2 mt-3 text-haas-red text-sm hover:underline">
                View {post.driver_name}&apos;s Profile &rarr;
              </Link>
            )}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-haas-light/10 text-xs text-gray-500">
              <span>{post.likes_count} likes</span>
              <span>{post.shares_count} shares</span>
              <span className="text-alpine-pink ml-auto">+25 RISE+ pts</span>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="text-center py-12 text-gray-500">No posts yet</div>}
      </div>
    </div>
  );
}
