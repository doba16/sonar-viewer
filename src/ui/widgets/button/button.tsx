import "./button.css"

type ButtonVariant = "primary" | "secondary"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant: ButtonVariant,
    startIcon?: string
    endIcon?: string,
    icon?: string
}

export function Button({
    children,
    variant,
    startIcon,
    endIcon,
    icon,
    ...rest
}: ButtonProps) {
    return (
        <button {...rest} className={`button ${variant}`}>
            {startIcon !== undefined && <span className="material-symbols-outlined start-icon">{startIcon}</span>}
            {icon !== undefined && <span className="material-symbols-outlined icon">{icon}</span>}
            {children}
            {endIcon !== undefined && <span className="material-symbols-outlined end-icon">{startIcon}</span>}
        </button>
    )
}