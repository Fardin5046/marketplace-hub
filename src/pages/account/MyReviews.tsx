import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { reviewApi } from "@/lib/api";
import { productImage } from "@/lib/mock-data";

export default function MyReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => { reviewApi.myReviews().then((d: any) => setReviews(d.reviews || [])).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">My reviews</h1>
      <p className="mt-2 text-muted-foreground">{reviews.length} reviews written</p>
      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? <p className="text-sm text-muted-foreground">You haven't written any reviews yet.</p> : reviews.map((r: any) => (
          <div key={r._id} className="card-surface p-5">
            <div className="flex items-center gap-4">
              {r.product && <img src={productImage(r.product)} alt="" className="h-14 w-14 rounded-xl object-cover bg-muted" />}
              <div className="flex-1">
                <p className="font-bold">{r.product?.title || 'Product'}</p>
                <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />)}</div>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            {r.title && <h4 className="mt-3 font-semibold">{r.title}</h4>}
            {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
