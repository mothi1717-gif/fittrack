import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { getClientForTrainer } from "@/lib/data/trainer";
import { getThread } from "@/lib/data/messages";
import { MessageThread } from "@/components/message-thread";

export default async function TrainerClientMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const trainer = await requireRole("trainer");
  const { id } = await params;

  const client = await getClientForTrainer(id).catch(() => null);
  if (!client) notFound();

  const messages = await getThread(id, trainer.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <nav className="mb-1 text-xs text-neutral-400">
        <Link href={`/trainer/clients/${id}`} className="hover:underline">{client.profile.full_name}</Link> / Messages
      </nav>
      <h1 className="mb-4 text-xl font-semibold text-neutral-900">{client.profile.full_name}</h1>
      <MessageThread
        clientId={id}
        trainerId={trainer.id}
        currentUserId={trainer.id}
        messages={messages as any}
      />
    </div>
  );
}
