import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ChatView } from "./ChatView";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-2 sm:p-4 flex justify-between items-center border-b">
        <img src="/logo.png" alt="Remdal Chat" className="h-6 sm:h-8" />
        <SignOutButton />
      </header>
      <main className="flex-1 flex">
        <div className="w-full max-w-5xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <Authenticated>
        <ChatView />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col gap-6 sm:gap-8 items-center justify-center rounded-lg max-w-xs sm:max-w-2xl border p-4 sm:p-8 mx-2 sm:mx-auto">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-blue-600 mb-2 sm:mb-4">Welcome to Remdal Chat</h1>
            <p className="text-lg sm:text-xl text-slate-600">Sign in to start messaging</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
