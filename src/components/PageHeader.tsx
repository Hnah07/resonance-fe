"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-12">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-lg text-text-secondary text-center">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
