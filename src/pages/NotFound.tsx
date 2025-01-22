import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

export function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex self-stretch flex-col items-center justify-center flex-1">
      <div className="max-w-md w-full px-6 text-center">
        <h1 className="mb-6">Page not found</h1>
        <p>
          Hey there partner, looks like you&rsquo;ve wandered into uncharted
          territory. The page you&rsquo;re looking for doesn&rsquo;t exist or
          has been moved.
        </p>

        {!user && (
          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
