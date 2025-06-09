"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-accent-pink group-[.toast]:text-accent-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toast]:bg-accent-cyan/10 group-[.toast]:border-accent-cyan/20",
          error:
            "group-[.toast]:bg-accent-pink/10 group-[.toast]:border-accent-pink/20",
          loading:
            "group-[.toast]:bg-accent-cyan/10 group-[.toast]:border-accent-cyan/20",
          default: "group-[.toast]:bg-background group-[.toast]:border-border",
        },
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
