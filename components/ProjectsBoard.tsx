'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import {
  PRIORITY_ZONES,
  ZONE_BADGE_COLORS,
  ZONE_COLORS,
  ZONE_LABELS,
  flattenZones,
  groupByZone,
  sortProjectsForPriorities,
  type PriorityZone,
  type ProjectPriorityItem,
  type ProjectRow,
} from '@/lib/project-priorities';

function ZoneDivider({ label, color }: { label: string; color: string }) {
  return (
    <div className="relative py-6">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full border-t-2 ${color}`} />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-slate-900 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  item: ProjectPriorityItem;
  onResponsibleBlur: (id: string, responsible: string) => void;
  onStatusChange: (id: string, zone: PriorityZone) => void;
  isDragging?: boolean;
}

function ProjectCard({ item, onResponsibleBlur, onStatusChange, isDragging }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id, data: { zone: item.zone } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex h-full flex-col rounded-xl border border-slate-600 bg-slate-800 p-4 shadow-sm transition-shadow hover:border-slate-500 hover:shadow-md ${
        isDragging ? 'shadow-xl ring-2 ring-blue-500/50' : ''
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Link
          href={`/projects/${item.slug}`}
          className="min-w-0 flex-1 font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2"
        >
          {item.name}
        </Link>
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none rounded-lg p-1.5 text-slate-500 hover:bg-slate-700 hover:text-slate-300 active:cursor-grabbing"
          aria-label={`Drag ${item.name}`}
          {...attributes}
          {...listeners}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>
      </div>

      {item.description && (
        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{item.description}</p>
      )}

      <div className="mt-auto space-y-2">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select
            value={item.zone}
            onChange={(e) => onStatusChange(item.id, e.target.value as PriorityZone)}
            className={`w-full rounded-lg border px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${ZONE_BADGE_COLORS[item.zone]}`}
          >
            {PRIORITY_ZONES.map((zone) => (
              <option key={zone} value={zone} className="bg-slate-800 text-white">
                {ZONE_LABELS[zone]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Responsible</label>
          <input
            type="text"
            defaultValue={item.responsible}
            onBlur={(e) => onResponsibleBlur(item.id, e.target.value)}
            placeholder="Unassigned"
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-2.5 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function ZoneSection({
  zone,
  items,
  onResponsibleBlur,
  onStatusChange,
  showTopDivider,
  dividerLabel,
  dividerColor,
}: {
  zone: PriorityZone;
  items: ProjectPriorityItem[];
  onResponsibleBlur: (id: string, responsible: string) => void;
  onStatusChange: (id: string, zone: PriorityZone) => void;
  showTopDivider?: boolean;
  dividerLabel?: string;
  dividerColor?: string;
}) {
  const ids = items.map((item) => item.id);
  const { setNodeRef, isOver } = useDroppable({ id: zone });

  return (
    <div data-zone={zone}>
      {showTopDivider && dividerLabel && dividerColor && (
        <ZoneDivider label={dividerLabel} color={dividerColor} />
      )}

      <div
        ref={setNodeRef}
        className={`rounded-2xl border p-4 min-h-[80px] transition-colors ${ZONE_COLORS[zone]} ${
          isOver ? 'ring-2 ring-blue-500/40' : ''
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
            {ZONE_LABELS[zone]}
          </h3>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
            {items.length}
          </span>
        </div>

        <SortableContext items={ids} strategy={rectSortingStrategy}>
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Drop projects here</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <ProjectCard
                  key={item.id}
                  item={item}
                  onResponsibleBlur={onResponsibleBlur}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function ProjectsBoard() {
  const [items, setItems] = useState<ProjectPriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dbError, setDbError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const grouped = useMemo(() => groupByZone(items), [items]);
  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 503) {
          setDbError(data.message || 'Database not initialized');
        }
        return;
      }
      const data = (await response.json()) as ProjectRow[];
      setItems(sortProjectsForPriorities(data));
      setDbError('');
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const persistOrder = async (nextGrouped: Record<PriorityZone, ProjectPriorityItem[]>) => {
    const flattened = flattenZones(nextGrouped);
    setItems(flattened);
    setSaving(true);

    try {
      const response = await fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: flattened.map((item) => ({
            id: item.id,
            zone: item.zone,
            sortOrder: item.sortOrder,
          })),
        }),
      });

      if (!response.ok) {
        await loadProjects();
      }
    } catch {
      await loadProjects();
    } finally {
      setSaving(false);
    }
  };

  const findZoneForId = (id: string, state: Record<PriorityZone, ProjectPriorityItem[]>) => {
    for (const zone of PRIORITY_ZONES) {
      if (state[zone].some((item) => item.id === id)) {
        return zone;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItemId = String(active.id);
    const overId = String(over.id);

    setItems((current) => {
      const state = groupByZone(current);
      const activeZone = findZoneForId(activeItemId, state);
      if (!activeZone) return current;

      let overZone: PriorityZone | null = null;
      if (PRIORITY_ZONES.includes(overId as PriorityZone)) {
        overZone = overId as PriorityZone;
      } else {
        overZone = findZoneForId(overId, state);
      }

      if (!overZone || activeZone === overZone) return current;

      const activeIndex = state[activeZone].findIndex((item) => item.id === activeItemId);
      const overIndex = PRIORITY_ZONES.includes(overId as PriorityZone)
        ? state[overZone].length
        : state[overZone].findIndex((item) => item.id === overId);

      if (activeIndex === -1) return current;

      const movingItem = state[activeZone][activeIndex];
      const nextActive = state[activeZone].filter((item) => item.id !== activeItemId);
      const nextOver = [...state[overZone]];
      const insertAt = overIndex >= 0 ? overIndex : nextOver.length;
      nextOver.splice(insertAt, 0, { ...movingItem, zone: overZone });

      return flattenZones({
        ...state,
        [activeZone]: nextActive,
        [overZone]: nextOver,
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeItemId = String(active.id);
    const overId = String(over.id);
    const state = groupByZone(items);
    const activeZone = findZoneForId(activeItemId, state);
    if (!activeZone) return;

    let overZone: PriorityZone | null = null;
    if (PRIORITY_ZONES.includes(overId as PriorityZone)) {
      overZone = overId as PriorityZone;
    } else {
      overZone = findZoneForId(overId, state);
    }

    if (!overZone) return;

    if (activeZone === overZone && activeItemId !== overId) {
      const oldIndex = state[activeZone].findIndex((item) => item.id === activeItemId);
      const newIndex = state[activeZone].findIndex((item) => item.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(state[activeZone], oldIndex, newIndex);
        persistOrder({ ...state, [activeZone]: reordered });
        return;
      }
    }

    persistOrder(state);
  };

  const patchProject = async (id: string, updates: Record<string, string>) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.ok ? response.json() : null;
  };

  const handleResponsibleBlur = async (id: string, responsible: string) => {
    const current = items.find((item) => item.id === id);
    if (!current || current.responsible === responsible.trim()) return;

    const trimmed = responsible.trim();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, responsible: trimmed } : item))
    );

    try {
      await patchProject(id, { responsible: trimmed });
    } catch (error) {
      console.error('Failed to update responsible:', error);
      loadProjects();
    }
  };

  const handleStatusChange = async (id: string, zone: PriorityZone) => {
    const current = items.find((item) => item.id === id);
    if (!current || current.zone === zone) return;

    const state = groupByZone(items);
    const fromZone = current.zone;
    const moving = state[fromZone].find((item) => item.id === id);
    if (!moving) return;

    const nextFrom = state[fromZone].filter((item) => item.id !== id);
    const nextTo = [...state[zone], { ...moving, zone }];
    const nextGrouped = { ...state, [fromZone]: nextFrom, [zone]: nextTo };

    persistOrder(nextGrouped);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-slate-400 mt-2">Loading projects...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="rounded-2xl border border-amber-700/50 bg-amber-950/20 p-8 text-center">
        <p className="text-amber-300 font-medium">{dbError}</p>
        <p className="text-slate-400 text-sm mt-2">
          Run PROJECT_PRIORITIES.sql in the Supabase SQL Editor to add priority columns to projects.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-2">
            Drag projects between Active, Prioritized, and In Design. Edit status and assign owners inline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-slate-500">Saving...</span>}
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            + New Project
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-slate-600 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-slate-400 mb-6 text-lg">No projects yet. Create your first project to get started.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2">
            <ZoneSection
              zone="active"
              items={grouped.active}
              onResponsibleBlur={handleResponsibleBlur}
              onStatusChange={handleStatusChange}
            />

            <ZoneSection
              zone="prioritized"
              items={grouped.prioritized}
              onResponsibleBlur={handleResponsibleBlur}
              onStatusChange={handleStatusChange}
              showTopDivider
              dividerLabel="Active → Prioritized"
              dividerColor="border-emerald-500/40"
            />

            <ZoneSection
              zone="in_design"
              items={grouped.in_design}
              onResponsibleBlur={handleResponsibleBlur}
              onStatusChange={handleStatusChange}
              showTopDivider
              dividerLabel="Prioritized → In Design"
              dividerColor="border-amber-500/40"
            />
          </div>

          <DragOverlay>
            {activeItem ? (
              <ProjectCard
                item={activeItem}
                onResponsibleBlur={() => {}}
                onStatusChange={() => {}}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadProjects}
      />
    </div>
  );
}