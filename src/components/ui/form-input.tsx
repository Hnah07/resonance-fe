import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "appearance-none relative block w-full px-3 py-2 border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FF0086] focus:border-transparent focus:z-10 sm:text-sm rounded-lg",
            error && "border-[#FF0086]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#FF0086]">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
