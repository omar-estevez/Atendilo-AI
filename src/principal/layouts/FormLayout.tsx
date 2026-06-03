import { ScrollManager } from "@/utils/ScrollManager"
import { Outlet } from "react-router"

export const FormLayout = () => {
    return (
        <>
            <ScrollManager />
            <Outlet />
        </>
    )
}

export default FormLayout;