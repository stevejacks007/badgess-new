"use client";

import { useCallback, useRef, useState } from "react";
import { DndContext, DragOverlay, closestCorners, type Modifier } from "@dnd-kit/core";
import { getDefinition, isRestrictedKind } from "@/lib/builder/catalog";
import { useBuilder } from "@/lib/builder/useBuilder";
import { useBuilderDnd } from "@/lib/builder/useBuilderDnd";
import { useAssets } from "@/lib/builder/useAssets";
import type { OverlayElement } from "@/lib/builder/types";
import Sidebar from "./Sidebar";
import BuilderCanvas from "./BuilderCanvas";
import CanvasViewport, { type ViewportHandle } from "./CanvasViewport";
import PropertiesPanel from "./PropertiesPanel";
import OverlayContent from "./OverlayContent";
import Header from "./Header";

export default function App() {
  const api = useBuilder();
  const assets = useAssets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [preview, setPreview] = useState(false);

  const deselect = () => setSelectedId(null);
  const scaleRef = useRef(1);
  const viewportRef = useRef<ViewportHandle>(null);
  const dnd = useBuilderDnd(api, () => scaleRef.current);

  const scaleModifier = useCallback<Modifier>(({ transform }) => {
    const s = scaleRef.current || 1;
    return { ...transform, x: transform.x / s, y: transform.y / s };
  }, []);

  const activeDef = dnd.active ? getDefinition(dnd.active.kind) : null;
  let overlayEl: OverlayElement | null = null;
  if (dnd.active?.source === "palette" && activeDef) {
    overlayEl = {
      id: "drag-preview",
      kind: dnd.active.kind,
      enabled: true,
      props: {
        ...activeDef.defaultProps,
        ...(dnd.active.padding !== undefined ? { padding: dnd.active.padding } : {}),
        ...(dnd.active.overrides ?? {}),
      },
    };
  }

  return (
    <DndContext
      sensors={dnd.sensors}
      collisionDetection={closestCorners}
      modifiers={[scaleModifier]}
      onDragStart={dnd.onDragStart}
      onDragOver={dnd.onDragOver}
      onDragEnd={dnd.onDragEnd}
    >
      <div className="flex h-full flex-col bg-slate-100">
        <Header
          title="Labels and Badges"
          dirty={api.dirty}
          zoom={zoom}
          preview={preview}
          onZoomIn={() => viewportRef.current?.zoomIn()}
          onZoomOut={() => viewportRef.current?.zoomOut()}
          onZoomSet={(s) => viewportRef.current?.setZoom(s)}
          onZoomReset={() => viewportRef.current?.reset()}
          onTogglePreview={() => setPreview((p) => !p)}
          onDiscard={api.discard}
          onSave={api.save}
        />

        <div className="flex min-h-0 flex-1">
          <Sidebar api={api} assets={assets} selectedId={selectedId} onSelect={setSelectedId} />
          <main className="relative min-w-0 flex-1" onClick={deselect}>
            <CanvasViewport
              ref={viewportRef}
              onScaleChange={(s) => {
                scaleRef.current = s;
                setZoom(s);
              }}
            >
              <BuilderCanvas
                api={api}
                selectedId={selectedId}
                activeZoneId={dnd.activeZoneId}
                dragging={!!dnd.active}
                preview={preview}
                onSelect={setSelectedId}
                onSelectCard={deselect}
              />
            </CanvasViewport>

            {!preview && (
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-4">
                <p className="max-w-md rounded-full bg-white/85 px-3.5 py-1.5 text-center text-[11px] leading-snug text-slate-500 shadow ring-1 ring-slate-200 backdrop-blur">
                  Faded <b className="font-semibold text-slate-600">mock elements</b> are for
                  representation only — not part of the product design. They help you visualize the
                  layout while designing.
                </p>
              </div>
            )}

            {preview && (
              <div className="pointer-events-none absolute inset-x-0 bottom-5 z-50 flex justify-center">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2 text-xs text-white shadow-lg ring-1 ring-black/10"
                >
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    You&apos;re in preview mode — turn off Preview in the toolbar to edit.
                  </span>
                  <button
                    onClick={() => setPreview(false)}
                    className="rounded-full bg-white/15 px-2.5 py-1 font-medium hover:bg-white/25"
                  >
                    Exit preview
                  </button>
                </div>
              </div>
            )}
          </main>
          <PropertiesPanel api={api} assets={assets} selectedId={selectedId} />
        </div>
      </div>

      <DragOverlay>
        {overlayEl && activeDef ? (
          <div className="opacity-90">
            <OverlayContent element={overlayEl} def={activeDef} />
          </div>
        ) : null}
      </DragOverlay>

      {api.pendingDrop && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 p-4">
          <div className="w-80 rounded-lg bg-white p-4 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">Replace existing element?</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              This product already has{" "}
              <b className="text-slate-700">
                {getDefinition(
                  [...Object.values(api.config.zones).flat(), ...api.config.detached].find((e) =>
                    isRestrictedKind(e.kind)
                  )?.kind ?? ""
                )?.name ?? "an element"}
              </b>
              . You can only have one badge, label, or timer per product. Adding{" "}
              <b className="text-slate-700">{getDefinition(api.pendingDrop.kind)?.name}</b> will remove it.
              This change won&apos;t be saved until you click Save.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={api.cancelPendingDrop}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Discard
              </button>
              <button
                onClick={api.confirmPendingDrop}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Add anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
