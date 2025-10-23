import * as React from "react"
import {
  ArrowUpCircleIcon,
  HelpCircleIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  ClockIcon,
  FolderIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ onLogout, ...props }: React.ComponentProps<typeof Sidebar> & { onLogout?: () => void }) {
  const user = React.useMemo(() => {
    const name = localStorage.getItem("user_name") || "vault"
    const email = localStorage.getItem("auth_email") || "m@example.com"
    const avatar = localStorage.getItem("user_avatar") || "/avatars/shadcn.jpg"
    return { name, email, avatar }
  }, [])

  const data = {
    user,
    navMain: [
      { title: "My Vault", url: "/files", icon: FolderIcon },
      { title: "Shared with Me", url: "/shared", icon: ShareIcon },
      { title: "Favorites", url: "/favorites", icon: StarIcon },
      { title: "Trash", url: "/trash", icon: TrashIcon },
    ],
    orgTools: [
      { title: "Workspaces", url: "/workspaces", icon: FolderIcon },
      { title: "Colleagues", url: "/team", icon: UsersIcon },
      { title: "Recents", url: "/recents", icon: ClockIcon },
    ],
    navSecondary: [
      { title: "Settings", url: "/settings", icon: SettingsIcon },
      { title: "Get Help / Docs", url: "/help", icon: HelpCircleIcon },
      { title: "Search", url: "/search", icon: SearchIcon },
    ],
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">vault</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary label="Project & Organization Tools" items={data.orgTools} />
        <NavSecondary label="Utilities & Settings" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
