import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-electric text-white hover:bg-electric-700",
        navy: "bg-navy text-white hover:bg-navy-800",
        ghost: "bg-white/10 text-white hover:bg-white/15",
        outline: "border border-line bg-white text-navy hover:border-electric",
        danger: "bg-red-700 text-white hover:bg-red-800",
      },
      size: {
        md: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Badge({ children, tone = "navy" }: { children: React.ReactNode; tone?: "navy" | "teal" | "amber" | "line" }) {
  const tones = {
    navy: "bg-navy text-white",
    teal: "bg-teal/10 text-teal",
    amber: "bg-amber/10 text-amber",
    line: "bg-mist text-muted",
  };
  return <span className={cn("inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
