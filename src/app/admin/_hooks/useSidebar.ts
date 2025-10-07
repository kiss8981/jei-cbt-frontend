import { SidebarItems } from "../_common/sidebar";

export type NavNode =
  | { kind: "group"; key: string; title: string; children: NavNode[] }
  | {
      kind: "item";
      key: string;
      title: string;
      url: string;
      isActive: boolean;
    };

const stripDynamic = (p: string) => p.replace(/\[.*?\]/g, "");
const isActiveByPaths = (
  activePaths: string[] | undefined,
  currentPath: string
) => !!activePaths?.some(p => currentPath.startsWith(stripDynamic(p)));
export type SidebarSchemaEntry = {
  path: string;
  activePaths?: string[];
  children?: Record<string, SidebarSchemaEntry>;
};

function normalizeEntry(
  title: string,
  cfg: SidebarSchemaEntry,
  currentPath: string,
  trail: string[]
): NavNode {
  const key = [...trail, title].join(" / ");

  if (cfg.children && Object.keys(cfg.children).length > 0) {
    // 부모 → 그룹
    const children = Object.entries(cfg.children).map(
      ([childTitle, childCfg]) =>
        normalizeEntry(childTitle, childCfg, currentPath, [...trail, title])
    );
    return { kind: "group", key, title, children };
  }

  // 리프 → 아이템
  const isActive = isActiveByPaths(cfg.activePaths, currentPath);
  return { kind: "item", key, title, url: cfg.path, isActive };
}

export function useSidebar(currentPath: string) {
  // 최상위(유저/알림/예약...) → 그룹으로 고정
  const nav = Object.entries(SidebarItems).map(([groupTitle, groupItems]) => {
    const children: NavNode[] = Object.entries(groupItems).map(([title, cfg]) =>
      normalizeEntry(title, cfg, currentPath, [groupTitle])
    );
    return {
      kind: "group" as const,
      key: groupTitle,
      title: groupTitle,
      children,
    };
  });

  return { nav }; // 상위는 전부 group
}
