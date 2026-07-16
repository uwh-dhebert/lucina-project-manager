'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import CreateLinkGroupModal from '@/components/CreateLinkGroupModal';
import CreateLinkModal from '@/components/CreateLinkModal';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  order?: number;
}

interface LinkGroup {
  id: string;
  name: string;
  order?: number;
  links: LinkItem[];
}

function DragHandle({
  attributes,
  listeners,
  label,
}: {
  // dnd-kit drag handle props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners?: any;
  label: string;
}) {
  return (
    <button
      type="button"
      className="shrink-0 cursor-grab touch-none rounded-lg p-1.5 text-lucina-muted hover:bg-lucina-surface hover:text-lucina-secondary active:cursor-grabbing"
      aria-label={label}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

function SortableLinkRow({
  link,
  onDelete,
}: {
  link: LinkItem;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: link.id,
    data: { type: 'link' as const },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 hover:bg-lucina-surface transition-colors flex items-start justify-between gap-2 bg-lucina-white"
    >
      <DragHandle attributes={attributes} listeners={listeners} label={`Drag ${link.title}`} />
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0"
      >
        <h3 className="text-sm font-semibold text-lucina-secondary hover:text-lucina-secondary transition-colors truncate">
          {link.title}
        </h3>
        <p className="text-xs text-lucina-muted truncate mt-0.5">{link.url}</p>
      </a>
      <button
        onClick={onDelete}
        className="flex-shrink-0 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
        title="Delete link"
      >
        🗑️
      </button>
    </div>
  );
}

function SortableGroupCard({
  group,
  editingGroupId,
  editingGroupName,
  onEditingNameChange,
  onStartEdit,
  onSaveName,
  onCancelEdit,
  onAddLink,
  onDeleteGroup,
  onDeleteLink,
  onLinkDragEnd,
}: {
  group: LinkGroup;
  editingGroupId: string | null;
  editingGroupName: string;
  onEditingNameChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onAddLink: () => void;
  onDeleteGroup: () => void;
  onDeleteLink: (linkId: string) => void;
  onLinkDragEnd: (event: DragEndEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: 'group' as const },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  const linkIds = useMemo(() => group.links.map((l) => l.id), [group.links]);
  const linkSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-lucina-rose rounded-2xl overflow-hidden bg-lucina-white flex flex-col h-full shadow-sm"
    >
      <div className="p-4 border-b border-lucina-rose flex justify-between items-start gap-2">
        <DragHandle attributes={attributes} listeners={listeners} label={`Drag group ${group.name}`} />
        {editingGroupId === group.id ? (
          <input
            type="text"
            value={editingGroupName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onBlur={() => onSaveName()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveName();
              if (e.key === 'Escape') onCancelEdit();
            }}
            autoFocus
            className="flex-1 min-w-0 px-2 py-1 text-lg font-bold text-lucina-primary bg-lucina-white border border-lucina-secondary rounded focus:outline-none focus:ring-2 focus:ring-lucina-secondary"
          />
        ) : (
          <h2 className="text-lg font-bold text-lucina-primary flex-1 min-w-0 truncate">
            {group.name}
          </h2>
        )}
        <div className="flex gap-1 flex-shrink-0">
          {editingGroupId !== group.id && (
            <button
              onClick={onStartEdit}
              className="p-1.5 text-lucina-secondary hover:text-lucina-primary hover:bg-lucina-surface rounded transition-colors"
              title="Edit group"
            >
              ✏️
            </button>
          )}
          <button
            onClick={onAddLink}
            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
            title="Add link"
          >
            ➕
          </button>
          <button
            onClick={onDeleteGroup}
            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Delete group"
          >
            🗑️
          </button>
        </div>
      </div>

      {group.links.length === 0 ? (
        <div className="p-4 text-center text-lucina-muted flex-1 flex items-center justify-center">
          <p className="text-sm">No links yet — drag groups to reorder</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <DndContext
            sensors={linkSensors}
            collisionDetection={closestCenter}
            onDragEnd={onLinkDragEnd}
          >
            <SortableContext items={linkIds} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-lucina-rose">
                {group.links.map((link) => (
                  <SortableLinkRow
                    key={link.id}
                    link={link}
                    onDelete={() => onDeleteLink(link.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

export default function LinksPage() {
  const [groups, setGroups] = useState<LinkGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [reorderError, setReorderError] = useState('');

  const groupSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const groupIds = useMemo(() => groups.map((g) => g.id), [groups]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/links/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const persistGroupOrder = useCallback(async (nextGroups: LinkGroup[]) => {
    setReorderError('');
    try {
      const response = await fetch('/api/links/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: nextGroups.map((g, index) => ({ id: g.id, order: index })),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save group order');
      }
    } catch (error) {
      console.error(error);
      setReorderError(error instanceof Error ? error.message : 'Failed to save group order');
      await loadGroups();
    }
  }, []);

  const persistLinkOrder = useCallback(
    async (groupId: string, nextLinks: LinkItem[]) => {
      setReorderError('');
      try {
        const response = await fetch('/api/links/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            links: nextLinks.map((link, index) => ({
              id: link.id,
              order: index,
              groupId,
            })),
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to save link order');
        }
      } catch (error) {
        console.error(error);
        setReorderError(error instanceof Error ? error.message : 'Failed to save link order');
        await loadGroups();
      }
    },
    []
  );

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGroups((prev) => {
      const oldIndex = prev.findIndex((g) => g.id === active.id);
      const newIndex = prev.findIndex((g) => g.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const next = arrayMove(prev, oldIndex, newIndex).map((g, index) => ({
        ...g,
        order: index,
      }));
      void persistGroupOrder(next);
      return next;
    });
  };

  const handleLinkDragEnd = (groupId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const oldIndex = group.links.findIndex((l) => l.id === active.id);
        const newIndex = group.links.findIndex((l) => l.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return group;
        const nextLinks = arrayMove(group.links, oldIndex, newIndex).map((link, index) => ({
          ...link,
          order: index,
        }));
        void persistLinkOrder(groupId, nextLinks);
        return { ...group, links: nextLinks };
      })
    );
  };

  const handleGroupCreated = (newGroup: LinkGroup) => {
    setGroups([...groups, { ...newGroup, links: newGroup.links ?? [] }]);
    setShowGroupModal(false);
  };

  const handleLinkCreated = (groupId: string, newLink: LinkItem) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? { ...group, links: [...group.links, newLink] }
          : group
      )
    );
    setShowLinkModal(false);
    setSelectedGroupId(null);
  };

  const handleDeleteLink = async (groupId: string, linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setGroups(
          groups.map((group) =>
            group.id === groupId
              ? { ...group, links: group.links.filter((l) => l.id !== linkId) }
              : group
          )
        );
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const startEditingGroup = (groupId: string, name: string) => {
    setEditingGroupId(groupId);
    setEditingGroupName(name);
  };

  const cancelEditingGroup = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleSaveGroupName = async (groupId: string) => {
    const name = editingGroupName.trim();
    if (!name) {
      cancelEditingGroup();
      return;
    }

    const current = groups.find((group) => group.id === groupId);
    if (!current || current.name === name) {
      cancelEditingGroup();
      return;
    }

    try {
      const response = await fetch(`/api/links/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update group');
      }

      const updated = await response.json();
      setGroups(
        groups.map((group) =>
          group.id === groupId ? { ...group, name: updated.name } : group
        )
      );
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      cancelEditingGroup();
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/links/groups/${groupId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setGroups(groups.filter((g) => g.id !== groupId));
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lucina-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-lucina-primary">Links</h1>
          <p className="text-lucina-muted mt-2">
            Organize links into groups — drag the handle to reorder groups and links
          </p>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="px-6 py-2.5 bg-lucina-rose text-lucina-primary font-medium rounded-full hover:bg-lucina-rose-hover transition-colors shadow-lg hover:shadow-xl"
        >
          + Add Group
        </button>
      </div>

      {reorderError && (
        <div className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm">
          {reorderError}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="border-2 border-dashed border-lucina-rose rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-lucina-primary mb-2">No groups yet</h2>
          <p className="text-lucina-muted mb-6">Create your first group and start adding links.</p>
          <button
            onClick={() => setShowGroupModal(true)}
            className="inline-block px-6 py-3 bg-lucina-rose text-lucina-primary font-medium rounded-full hover:bg-lucina-rose-hover transition-colors shadow-lg hover:shadow-xl"
          >
            Create First Group
          </button>
        </div>
      ) : (
        <DndContext
          sensors={groupSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleGroupDragEnd}
        >
          <SortableContext items={groupIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <SortableGroupCard
                  key={group.id}
                  group={group}
                  editingGroupId={editingGroupId}
                  editingGroupName={editingGroupName}
                  onEditingNameChange={setEditingGroupName}
                  onStartEdit={() => startEditingGroup(group.id, group.name)}
                  onSaveName={() => void handleSaveGroupName(group.id)}
                  onCancelEdit={cancelEditingGroup}
                  onAddLink={() => {
                    setSelectedGroupId(group.id);
                    setShowLinkModal(true);
                  }}
                  onDeleteGroup={() => void handleDeleteGroup(group.id)}
                  onDeleteLink={(linkId) => void handleDeleteLink(group.id, linkId)}
                  onLinkDragEnd={handleLinkDragEnd(group.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showGroupModal && (
        <CreateLinkGroupModal
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {showLinkModal && selectedGroupId && (
        <CreateLinkModal
          groupId={selectedGroupId}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedGroupId(null);
          }}
          onLinkCreated={(link) => handleLinkCreated(selectedGroupId, link)}
        />
      )}
    </div>
  );
}
