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
        <Logo className="w-[20px] mb-6 mx-auto text-white" />
        <h1 className="text-3xl font-bold text-white">Loud</h1>
        <p className="text-[--color-gray-300] font-medium text-balance">
          The new music database
        </p>
      </div>
      <AuthTabs defaultTab={mode === "reset" ? "reset" : "signin"} />
    </div>
  );
}
