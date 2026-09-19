import { useEffect, useRef, type PropsWithChildren } from "react";
import "./dialog.css"
import { Button } from "../button/button";

type DialogProps = PropsWithChildren<{
    open: boolean,
    title?: string,
    primaryButtonText?: string,
    primaryButtonCallback?: () => void,
    secondaryButtonText?: string,
    secondaryButtonCallback?: () => void,
}>

export function Dialog({
    open = false,
    children,
    title,
    primaryButtonText,
    primaryButtonCallback,
    secondaryButtonText,
    secondaryButtonCallback
}: DialogProps) {

    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (open) {
            dialog.showModal()
        } else {
            dialog.close()
        }
    }, [open])

    return (
        <dialog className="dialog" ref={dialogRef}>
            {title && (
                <h3 className="dialog-title">
                    {title}
                </h3>
            )}

            <div className="dialog-body">
                {children}
            </div>

            {(primaryButtonText !== undefined || secondaryButtonText !== undefined) && (
                <div className="dialog-footer">
                    {secondaryButtonText !== undefined && (
                        <Button onClick={secondaryButtonCallback} variant="secondary">
                            {secondaryButtonText}
                        </Button>
                    )}
                    {primaryButtonText !== undefined && (
                        <Button onClick={primaryButtonCallback} variant="primary">
                            {primaryButtonText}
                        </Button>
                    )}
                </div>
            )}
        </dialog>
    )
}
