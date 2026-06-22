import { cn } from "@/lib/utils"

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
        hover && "transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:border-brand-200 dark:hover:border-brand-500/30 dark:hover:shadow-brand-900/20 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={cn("flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800", className)}>{children}</div>
}

export function CardBody({ children, className }) {
  return <div className={cn("p-5", className)}>{children}</div>
}

export function CardTitle({ children, className }) {
  return <h3 className={cn("text-base font-semibold text-gray-900 dark:text-gray-100", className)}>{children}</h3>
}