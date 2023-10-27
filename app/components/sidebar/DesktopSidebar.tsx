'use client'

import useRoutes from "@/app/hooks/useRoutes"
import DesktopItem from "./DesktopItem"
import { useState } from "react"
import { User } from "@prisma/client"

interface Props {
    currentUser: User
}

const DesktopSidebar: React.FC<Props> = ({
    currentUser
}) => {
    const routes = useRoutes()
    const [open, setOpen] = useState(false)

    return (
        <div className="
            hidden 
            lg:fixed 
            lg:inset-0 
            lg:left-0 
            lg:z-40
            lg:w-20
            xl:px-6
            lg:overflow-auto
            lg:bg-white
            lg:border-r-[1px]
            lg:pb-4
            lg:flex
            lg:flex-col
            justify-between
            "
        >
            <nav className="mt-4 flex flex-col justify-between">
                <ul role="list" className="flex flex-col items-center space-y-1">
                    {routes.map((item) => (
                        <DesktopItem 
                        key={item.label} 
                        href={item.href} 
                        label={item.label} 
                        icon={item.icon} 
                        onClick={item.onClick} 
                        active={item.active}
                        />
                    ))}
                </ul>
            </nav>
        </div>
    )
}

export default DesktopSidebar