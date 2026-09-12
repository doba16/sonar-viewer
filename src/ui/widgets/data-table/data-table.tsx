import type { PropsWithChildren } from "react"
import "./data-table.css"

type DataTableProps = PropsWithChildren<{
}>

export function DataTable({
    children
}: DataTableProps) {
    return (
        <table className="data-table">
            {children}
        </table>
    )
}
