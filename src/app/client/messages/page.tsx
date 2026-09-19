import { requireRole } from "@/lib/auth/require-role";
import { getMyActiveTrainer } from "@/lib/data/client";
import { getThread } from "@/lib/data/messages";
import { MessageThread } from "@/components/message-thread";

export default async function ClientMessagesPage() {
  const profile = await requireRole("client");
  const trainer = await getMyActiveTrainer(profile.id);

  if (!trainer) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-4 text-lg font-semibold text-neutral-900">Messages</h1>
        <p className="text-sm text-neutral-500">You don&apos;t have an assigned trainer yet.</p>
      </div>
    );
  }

  const messages = await getThread(profile.id, trainer.id);

  return (
    <div className="px-4 py-6">
      <h1 className="mb-1 text-lg font-semibold text-neutral-900">{trainer.fullName}</h1>
      <p className="mb-4 text-xs text-neutral-400">Your trainer</p>
      <MessageThread
        clientId={profile.id}
        trainerId={trainer.id}
        currentUserId={profile.id}
        messages={messages as any}
      />
    </div>
  );
}
