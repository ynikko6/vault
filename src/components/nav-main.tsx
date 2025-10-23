import { MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const location = useLocation()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url && item.url.startsWith("/")
              ? (item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url))
              : false
            return (
              <SidebarMenuItem key={item.title}>
                {item.url && item.url.startsWith("/") ? (
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
