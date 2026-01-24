import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                style={{ backgroundColor: 'white', color: 'black', borderColor: 'gray' }}
                className={cn(
                    "w-full p-4 bg-white text-black border-2 border-gray-300 rounded-lg focus:border-blue-600 outline-none",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
