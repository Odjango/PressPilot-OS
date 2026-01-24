import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const CustomSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    style={{ backgroundColor: 'white', color: 'black', borderColor: 'gray' }}
                    className={cn(
                        "flex h-12 w-full appearance-none rounded-xl border-2 border-gray-300 bg-white px-4 py-2 pr-10 text-sm ring-offset-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black transition-all duration-200 hover:border-gray-400",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
        )
    }
)
CustomSelect.displayName = "CustomSelect"

export { CustomSelect }
