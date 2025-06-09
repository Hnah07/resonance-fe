"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      toastOptions={{
        classNames: {
          toast: "",
          description: "",
          actionButton: "",
          cancelButton: "",
          success: "",
          error: "",
          loading: "",
          default: "",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
