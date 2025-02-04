import React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageTitle = ({ title, subtitle, actions }: PageTitleProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8">
      <div>
        <h1 className="text-4xl font-[650] text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[--color-gray-400] font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row gap-3 order-first sm:order-last">
          {actions}
        </div>
      )}
    </div>
  );
};
