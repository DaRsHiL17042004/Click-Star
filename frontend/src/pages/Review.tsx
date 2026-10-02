import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Avatar, Button, Card, Field, Skeleton, StarInput, Textarea } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useCreateReview, usePhotographer } from "@/hooks/queries";
import { errorMessage } from "@/lib/utils";

export default function ReviewPage() {
  const { photographerId = "", bookingId = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: p, isLoading } = usePhotographer(photographerId);
  const create = useCreateReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!rating) return;
    create.mutate(
      { clientId: user!.id, photographerId, bookingId, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Thanks — your review is live.");
          navigate(`/photographers/${photographerId}`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="container max-w-2xl flex-1 py-10 md:py-14">
        <Link to="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> My bookings
        </Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mt-6 font-display text-xl font-medium">How was your shoot?</h1>
          <Card className="mt-8 p-6 md:p-8">
            {isLoading || !p ? (
              <Skeleton className="h-10 w-1/2" />
            ) : (
              <div className="flex items-center gap-3">
                <Avatar name={p.name} size={44} />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted">{p.specialties.slice(0, 2).join(" · ")}</p>
                </div>
              </div>
            )}
            <form onSubmit={submit} className="mt-8 space-y-6" noValidate>
              <div>
                <p className="mb-2 text-sm font-medium">Your rating</p>
                <StarInput value={rating} onChange={setRating} />
                {touched && !rating && <p role="alert" className="mt-2 text-xs font-medium text-danger">Tap a star to rate your experience.</p>}
              </div>
              <Field label="Tell others about it (optional)" htmlFor="comment" hint={`${comment.length}/600`}>
                <Textarea id="comment" maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Punctuality, how they handled the crowd, the final edits…" data-testid="input-comment" />
              </Field>
              {create.isError && <p role="alert" className="rounded-md bg-danger/10 p-3 text-sm text-danger">{errorMessage(create.error)}</p>}
              <Button type="submit" variant="secondary" size="lg" loading={create.isPending} className="w-full sm:w-auto" data-testid="button-submit-review">
                Publish review
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
