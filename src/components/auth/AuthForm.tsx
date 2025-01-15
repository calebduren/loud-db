import React from "react";
import { AuthTabs } from "./AuthTabs";
import { useSearchParams } from "react-router-dom";
import { Logo } from "../ui/Logo";

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Logo className="mx-auto mb-4 text-white" />
        <h1 className="text-2xl font-bold text-white">Loud</h1>
        <p className="text-white/80 font-medium text-sm">
          A platform for discovering new music
        </p>
      </div>
      <div>
        <AuthTabs defaultTab={mode === "reset" ? "reset" : "signin"} />
      </div>
    </div>
  );
}
