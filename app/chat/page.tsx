import { Suspense } from "react";
import ChatContent from "@/components/chat/ChatContent";

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
