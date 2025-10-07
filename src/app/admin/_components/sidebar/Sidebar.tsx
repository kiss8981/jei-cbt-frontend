"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { PropsWithChildren } from "react";
import { NavNode, useSidebar } from "../../_hooks/useSidebar";
import { DashboardSidebar } from "./DashboardSidebar";

// 활성화된 nav item의 경로를 찾는 함수
function findActiveNavPath(nav: NavNode[]): NavNode[] {
  let bestMatch: NavNode[] | null = null;
  let bestSpecificity = 0;

  function searchNode(nodes: NavNode[], currentPath: NavNode[] = []): void {
    for (const node of nodes) {
      if (node.kind === "item" && node.isActive) {
        // 현재 경로의 깊이를 구체성 점수로 사용
        const specificity = currentPath.length + 1;
        if (specificity > bestSpecificity) {
          bestMatch = [...currentPath, node];
          bestSpecificity = specificity;
        }
      }
      if (node.kind === "group") {
        searchNode(node.children, [...currentPath, node]);
      }
    }
  }

  searchNode(nav);
  return bestMatch || [];
}

// nav 경로를 breadcrumb으로 변환
function navPathToBreadcrumbs(navPath: NavNode[]) {
  const breadcrumbs = [];

  for (let i = 0; i < navPath.length; i++) {
    const node = navPath[i];
    const isLast = i === navPath.length - 1;

    if (node.kind === "group") {
      breadcrumbs.push({
        href: "",
        label: node.title,
        isLast: false,
        isGroup: true,
      });
    } else if (node.kind === "item") {
      breadcrumbs.push({
        href: node.url,
        label: node.title,
        isLast,
        isGroup: false,
      });
    }
  }

  return breadcrumbs;
}

export function AdminSidebar({
  defaultOpen,
  children,
}: PropsWithChildren<{ defaultOpen?: boolean }>) {
  const currentPath = usePathname() || "/";
  const { nav } = useSidebar(currentPath);

  // 활성화된 nav item 경로 찾기
  const activeNavPath = findActiveNavPath(nav);
  const breadcrumbs = navPathToBreadcrumbs(activeNavPath);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar currentPath={currentPath} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={`breadcrumb-${index}`}>
                  {index > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem className="hidden md:block">
                    {breadcrumb.isLast ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : breadcrumb.isGroup ? (
                      // 그룹은 링크 없이 텍스트만
                      <span className="text-muted-foreground">
                        {breadcrumb.label}
                      </span>
                    ) : (
                      // item은 링크 가능
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
