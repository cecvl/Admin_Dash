"use client"

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            style={
                {
                    "--normal-bg": "hsl(0 0% 100%)",
                    "--normal-text": "hsl(222.2 84% 4.9%)",
                    "--normal-border": "hsl(214.3 31.8% 91.4%)",
                    "--border-radius": "0.5rem",
                } as React.CSSProperties
            }
            {...props}
        />
    )
}

export { Toaster }
