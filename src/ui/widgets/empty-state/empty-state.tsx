import "./empty-state.css"

type EmptyStateProps = {
    icon: React.ReactNode
    title?: string,
    description?: React.ReactNode,
    action?: React.ReactNode
}

export function EmptyState({
    icon,
    title,
    description,
    action
}: EmptyStateProps) {
    return (
        <div className="empty-state">
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
