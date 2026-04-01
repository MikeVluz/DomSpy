"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getPageStatus, STATUS_COLORS } from "@/types";

interface PageNode {
  id: string;
  url: string;
  title: string | null;
  statusCode: number | null;
  responseTime: number | null;
  parentPageId: string | null;
  linksFrom: { href: string; toPageId: string | null }[];
}

interface SiteTreeGraphProps {
  pages: PageNode[];
  onNodeClick: (pageId: string) => void;
}

function buildTreeLayout(pages: PageNode[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Build hierarchy
  const rootPages = pages.filter((p) => !p.parentPageId);
  const childrenMap = new Map<string, PageNode[]>();

  for (const page of pages) {
    if (page.parentPageId) {
      const children = childrenMap.get(page.parentPageId) || [];
      children.push(page);
      childrenMap.set(page.parentPageId, children);
    }
  }

  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 80;
  const H_GAP = 40;
  const V_GAP = 120;

  // Calculate subtree widths
  const subtreeWidths = new Map<string, number>();

  function calcWidth(pageId: string): number {
    const children = childrenMap.get(pageId) || [];
    if (children.length === 0) {
      subtreeWidths.set(pageId, NODE_WIDTH);
      return NODE_WIDTH;
    }
    const total = children.reduce(
      (sum, c) => sum + calcWidth(c.id) + H_GAP,
      -H_GAP
    );
    const width = Math.max(NODE_WIDTH, total);
    subtreeWidths.set(pageId, width);
    return width;
  }

  // Position nodes
  function positionNode(
    page: PageNode,
    x: number,
    y: number,
    depth: number
  ) {
    const status = getPageStatus(page.statusCode, page.responseTime);
    const colors = STATUS_COLORS[status];

    // Truncate URL for display
    let displayUrl = page.url;
    try {
      const urlObj = new URL(page.url);
      displayUrl = urlObj.pathname === "/" ? urlObj.hostname : urlObj.pathname;
    } catch {
      // keep original
    }

    const label = page.title || displayUrl;
    const truncatedLabel =
      label.length > 30 ? label.slice(0, 27) + "..." : label;

    nodes.push({
      id: page.id,
      position: { x, y },
      data: {
        label: (
          <div className="text-center px-2 py-1">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: colors.text }}
            >
              {truncatedLabel}
            </div>
            <div
              className="text-[10px] mt-0.5 opacity-80"
              style={{ color: colors.text }}
            >
              {page.statusCode === null ? "Pendente" : page.statusCode === 0 ? "ERR" : `${page.statusCode} | ${page.responseTime || "?"}ms`}
            </div>
          </div>
        ),
      },
      style: {
        background: colors.bg,
        border: "none",
        borderRadius: "12px",
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        cursor: "pointer",
      },
    });

    // Position children
    const children = childrenMap.get(page.id) || [];
    if (children.length > 0) {
      const totalChildrenWidth = children.reduce(
        (sum, c) => sum + (subtreeWidths.get(c.id) || NODE_WIDTH) + H_GAP,
        -H_GAP
      );
      let childX = x + NODE_WIDTH / 2 - totalChildrenWidth / 2;

      for (const child of children) {
        const childWidth = subtreeWidths.get(child.id) || NODE_WIDTH;
        const childCenterX = childX + childWidth / 2 - NODE_WIDTH / 2;

        edges.push({
          id: `${page.id}-${child.id}`,
          source: page.id,
          target: child.id,
          style: { stroke: "#94a3b8", strokeWidth: 2 },
          animated: false,
        });

        positionNode(child, childCenterX, y + NODE_HEIGHT + V_GAP, depth + 1);
        childX += childWidth + H_GAP;
      }
    }
  }

  // Layout all root nodes
  let rootX = 0;
  for (const root of rootPages) {
    calcWidth(root.id);
  }

  for (const root of rootPages) {
    const width = subtreeWidths.get(root.id) || NODE_WIDTH;
    positionNode(root, rootX, 0, 0);
    rootX += width + H_GAP * 2;
  }

  // Handle orphan pages (pages with parentPageId but parent not in results)
  const positionedIds = new Set(nodes.map((n) => n.id));
  const orphans = pages.filter(
    (p) => !positionedIds.has(p.id)
  );

  let orphanX = rootX + H_GAP * 2;
  for (const orphan of orphans) {
    const status = getPageStatus(orphan.statusCode, orphan.responseTime);
    const colors = STATUS_COLORS[status];

    let displayUrl = orphan.url;
    try {
      displayUrl = new URL(orphan.url).pathname;
    } catch {
      // keep original
    }

    nodes.push({
      id: orphan.id,
      position: { x: orphanX, y: 0 },
      data: {
        label: (
          <div className="text-center px-2 py-1">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: colors.text }}
            >
              {(orphan.title || displayUrl).slice(0, 27)}
            </div>
            <div
              className="text-[10px] mt-0.5 opacity-80"
              style={{ color: colors.text }}
            >
              {orphan.statusCode || "ERR"} | {orphan.responseTime || "?"}ms
            </div>
          </div>
        ),
      },
      style: {
        background: colors.bg,
        border: "none",
        borderRadius: "12px",
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        cursor: "pointer",
      },
    });
    orphanX += NODE_WIDTH + H_GAP;
  }

  return { nodes, edges };
}

export default function SiteTreeGraph({
  pages,
  onNodeClick,
}: SiteTreeGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildTreeLayout(pages),
    [pages]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  if (pages.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400">
          Nenhuma p\u00e1gina encontrada. Execute um crawl primeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
        <Controls
          showInteractive={false}
          className="!bg-white !border-gray-200 !rounded-xl !shadow-lg"
        />
        <MiniMap
          nodeColor={(node) => {
            const style = node.style as Record<string, string> | undefined;
            return style?.background || "#94a3b8";
          }}
          className="!bg-gray-50 !border-gray-200 !rounded-xl"
        />
      </ReactFlow>
    </div>
  );
}
