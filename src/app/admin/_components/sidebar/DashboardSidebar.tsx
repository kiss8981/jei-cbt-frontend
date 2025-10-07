"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NavNode, useSidebar } from "../../_hooks/useSidebar";
import { useAdminAuthStore } from "@/lib/store/providers/admin-auth.provider";

type Props = React.ComponentProps<typeof Sidebar> & { currentPath: string };

function hasActiveDescendant(node: NavNode): boolean {
  if (node.kind === "item") return node.isActive;
  return node.children.some(c => hasActiveDescendant(c));
}

export function DashboardSidebar({ currentPath, ...props }: Props) {
  const { nav } = useSidebar(currentPath);
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setOpenMap({});
  }, [currentPath]);

  const setOpen = (key: string, v: boolean) =>
    setOpenMap(s => ({ ...s, [key]: v }));

  const name = useAdminAuthStore(s => s.user?.name);

  // 리프 아이템들만 메뉴로 렌더
  const renderLeafMenu = (leaves: Extract<NavNode, { kind: "item" }>[]) => (
    <SidebarMenu>
      {leaves.map(item => (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <a href={item.url}>{item.title}</a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
  // 그룹을 재귀 렌더
  const renderGroup = (group: Extract<NavNode, { kind: "group" }>) => {
    const computedOpen = openMap[group.key] ?? hasActiveDescendant(group);
    const subGroups = group.children.filter(
      (c): c is Extract<NavNode, { kind: "group" }> => c.kind == "group"
    );
    const leafItems = group.children.filter(
      (c): c is Extract<NavNode, { kind: "item" }> => c.kind == "item"
    );

    return (
      <Collapsible
        key={group.key}
        open={computedOpen}
        onOpenChange={v => setOpen(group.key, v)}
        className="group/collapsible"
      >
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
          >
            <CollapsibleTrigger>
              {group.title}
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <CollapsibleContent>
            <SidebarGroupContent>
              {/* 리프만 Menu로 */}
              {leafItems.length > 0 && renderLeafMenu(leafItems)}
              {/* 자식 그룹은 그룹으로 재귀 */}
              {subGroups.map(sg => renderGroup(sg))}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-6">
        <Link className="flex items-center w-full" href="/">
          <img
            src="/images/logo.png"
            alt="재능고등학교"
            className="mx-auto w-42"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0 my-5">
        <a href="/admin" className="text-sm p-2 font-bold">
          메뉴
        </a>
        {nav.map(top => renderGroup(top))}
      </SidebarContent>
      <SidebarFooter className="px-4 py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-bodydark2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.121 17.804A4.992 4.992 0 0112 15a4.992 4.992 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0zM12 13c-2.2 0-4 1.8-4 4v1h8v-1c0-2.2-1.8-4-4-4z"
                    />
                  </svg>
                  {name}
                  <ChevronRight className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                className="w-[--radix-popper-anchor-width]"
              >
                {/* <DropdownMenuItem onClick={handleLogout}>
                  <span>로그아웃</span>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
