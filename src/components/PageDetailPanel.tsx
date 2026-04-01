"use client";

import { getPageStatus, STATUS_COLORS } from "@/types";
import {
  XMarkIcon,
  GlobeAltIcon,
  ClockIcon,
  DocumentTextIcon,
  LinkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface PageDetail {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  statusCode: number | null;
  responseTime: number | null;
  linksFrom: {
    href: string;
    statusCode: number | null;
    isExternal: boolean;
    anchor: string | null;
  }[];
}

interface PageDetailPanelProps {
  page: PageDetail;
  onClose: () => void;
  onDismissAlert?: (pageId: string, alertType: string) => void;
  dismissedAlerts?: Set<string>;
}

export default function PageDetailPanel({
  page,
  onClose,
  onDismissAlert,
  dismissedAlerts = new Set(),
}: PageDetailPanelProps) {
  const status = getPageStatus(page.statusCode, page.responseTime);
  const colors = STATUS_COLORS[status];

  const issues: { type: string; message: string }[] = [];
  if (!page.title) issues.push({ type: "missing_title", message: "Sem tag <title>" });
  if (!page.description) issues.push({ type: "missing_description", message: "Sem meta description" });
  if (!page.h1) issues.push({ type: "missing_h1", message: "Sem tag <h1>" });
  if (page.title && page.h1 && page.title !== page.h1) {
    issues.push({ type: "title_h1_mismatch", message: "Title e H1 s\u00e3o diferentes" });
  }
  if (page.description && page.description.length < 50) {
    issues.push({ type: "short_description", message: `Meta description muito curta (${page.description.length} chars)` });
  }
  if (page.description && page.description.length > 160) {
    issues.push({ type: "long_description", message: `Meta description muito longa (${page.description.length} chars)` });
  }

  const visibleIssues = issues.filter(
    (i) => !dismissedAlerts.has(`${page.id}:${i.type}`)
  );

  const brokenLinks = page.linksFrom.filter(
    (l) => l.statusCode && l.statusCode >= 400
  );
  const externalLinks = page.linksFrom.filter((l) => l.isExternal);

  return (
    <div className="fixed right-0 top-0 h-screen w-[420px] bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5" style={{ color: colors.text }} />
          <span className="text-sm font-semibold" style={{ color: colors.text }}>
            {colors.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" style={{ color: colors.text }} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-[#1a1a2e] break-all">
            {page.title || page.url}
          </h3>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#3B82F6] hover:underline break-all"
          >
            {page.url}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1">Status Code</div>
            <div className="text-xl font-bold text-[#1a1a2e]">
              {page.statusCode === null ? "Pendente" : page.statusCode === 0 ? "ERR" : page.statusCode}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <ClockIcon className="w-3 h-3" /> Tempo de Resposta
            </div>
            <div className="text-xl font-bold text-[#1a1a2e]">
              {page.responseTime ? `${page.responseTime}ms` : "N/A"}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" /> Conte\u00fado
          </h4>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Title</div>
              <div className="text-sm text-[#1a1a2e]">
                {page.title || <span className="text-[#DC4C64]">N\u00e3o encontrado</span>}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">H1</div>
              <div className="text-sm text-[#1a1a2e]">
                {page.h1 || <span className="text-[#DC4C64]">N\u00e3o encontrado</span>}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Meta Description</div>
              <div className="text-sm text-[#1a1a2e]">
                {page.description || <span className="text-[#DC4C64]">N\u00e3o encontrada</span>}
              </div>
            </div>
          </div>
        </div>

        {visibleIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#DC4C64] flex items-center gap-2">
              <ExclamationCircleIcon className="w-4 h-4" /> Problemas ({visibleIssues.length})
            </h4>
            <div className="space-y-1">
              {visibleIssues.map((issue) => (
                <div
                  key={issue.type}
                  className="bg-[#DC4C64]/5 text-[#DC4C64] px-3 py-2 rounded-lg text-sm flex items-center justify-between"
                >
                  <span>{issue.message}</span>
                  {onDismissAlert && (
                    <button
                      onClick={() => onDismissAlert(page.id, issue.type)}
                      className="ml-2 p-1 hover:bg-[#DC4C64]/10 rounded transition-colors shrink-0"
                      title="Ignorar alerta"
                    >
                      <EyeSlashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleIssues.length === 0 && (
          <div className="flex items-center gap-2 text-[#14A44D] bg-[#14A44D]/5 px-4 py-3 rounded-xl">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm font-medium">
              Nenhum problema encontrado
            </span>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Links ({page.linksFrom.length})
          </h4>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Internos: {page.linksFrom.length - externalLinks.length}</div>
            <div>Externos: {externalLinks.length}</div>
            {brokenLinks.length > 0 && (
              <div className="text-[#DC4C64] font-medium">
                Quebrados: {brokenLinks.length}
              </div>
            )}
          </div>
          {brokenLinks.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {brokenLinks.map((link, i) => (
                <div
                  key={i}
                  className="bg-[#DC4C64]/5 px-3 py-2 rounded-lg text-xs text-[#DC4C64] break-all"
                >
                  [{link.statusCode}] {link.href}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
