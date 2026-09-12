import "./empty-state.css"

type EmptyStateProps = {
    icon: React.ReactNode
    title?: string,
    description?: React.ReactNode,
    action?: React.ReactNode,
    size?: "small" | "medium" | "large"
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    size
}: EmptyStateProps) {
    if (size === undefined) {
        size = "large"
    }

    return (
        <div className={`empty-state ${size}`}>
            { icon }
            { title && 
                <div className="title">
                    {title}
                </div>
            }
            { description && 
                <div className="description">
                    {description}
                </div>
            }
            { action && 
                <div className="description">
                    {action}
                </div>
            }
        </div>
    )
}
