import {
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  DndContext,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';

import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import type { ApplicationStatus, JobApplication } from '../../types/application';

const KANBAN_COLUMNS: Array<{ status: ApplicationStatus; label: string }> = [
  { status: 'applied', label: 'Applied' },
  { status: 'phone_screen', label: 'Phone Screen' },
  { status: 'interview', label: 'Interview' },
  { status: 'offer', label: 'Offer' },
  { status: 'rejected', label: 'Rejected' },
];

interface KanbanBoardProps {
  applications: JobApplication[];
  isLoading: boolean;
  isMovingStatus: boolean;
  onMoveStatus: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  onCardClick: (applicationId: string) => void;
}

interface KanbanColumnProps {
  status: ApplicationStatus;
  label: string;
  cards: JobApplication[];
  isMovingStatus: boolean;
  onCardClick: (applicationId: string) => void;
}

interface ApplicationCardProps {
  application: JobApplication;
  onCardClick: (applicationId: string) => void;
}

const formatDate = (dateString: string): string => {
  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return parsedDate.toLocaleDateString();
};

const isColumnStatus = (value: string): value is ApplicationStatus => {
  return KANBAN_COLUMNS.some((column) => column.status === value);
};

const ApplicationCard = ({ application, onCardClick }: ApplicationCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
      data: {
        status: application.status,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md ${
        isDragging ? 'opacity-60' : 'opacity-100'
      }`}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) {
          onCardClick(application.id);
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onCardClick(application.id);
        }
      }}
    >
      <p className="text-sm font-semibold text-slate-900">{application.company}</p>
      <p className="mt-1 text-xs text-slate-600">{application.role}</p>
      <p className="mt-2 text-xs text-slate-500">Applied: {formatDate(application.dateApplied)}</p>
    </article>
  );
};

const KanbanColumn = ({
  status,
  label,
  cards,
  isMovingStatus,
  onCardClick,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-56 rounded-2xl border p-3 transition ${
        isOver
          ? 'border-amber-400 bg-amber-50/60'
          : 'border-slate-200 bg-white/80'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {cards.length}
        </span>
      </div>

      <div className="space-y-2">
        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-xs text-slate-500">
            {isMovingStatus ? 'Updating...' : 'Drop card here'}
          </div>
        ) : (
          cards.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onCardClick={onCardClick}
            />
          ))
        )}
      </div>
    </section>
  );
};

export const KanbanBoard = ({
  applications,
  isLoading,
  isMovingStatus,
  onMoveStatus,
  onCardClick,
}: KanbanBoardProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const columnsWithCards = useMemo(() => {
    return KANBAN_COLUMNS.map((column) => {
      const cards = applications.filter((application) => application.status === column.status);

      return {
        ...column,
        cards,
      };
    });
  }, [applications]);

  const activeApplication = useMemo(() => {
    if (!activeId) {
      return null;
    }

    return applications.find((application) => application.id === activeId) ?? null;
  }, [activeId, applications]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const draggedId = String(event.active.id);
    const destination = event.over?.id ? String(event.over.id) : null;
    setActiveId(null);

    if (!destination || !isColumnStatus(destination)) {
      return;
    }

    const movedApplication = applications.find((application) => application.id === draggedId);

    if (!movedApplication || movedApplication.status === destination) {
      return;
    }

    await onMoveStatus(draggedId, destination);
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {KANBAN_COLUMNS.map((column) => (
            <div
              key={column.status}
              className="rounded-2xl border border-slate-200 bg-white/80 p-3"
            >
              <Skeleton className="h-4 w-24" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No Applications Yet"
        description="Add your first application using the form above, then drag cards across your hiring pipeline."
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={(event) => {
        void handleDragEnd(event);
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {columnsWithCards.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            cards={column.cards}
            isMovingStatus={isMovingStatus}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <div className="w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
            <p className="text-sm font-semibold text-slate-900">{activeApplication.company}</p>
            <p className="mt-1 text-xs text-slate-600">{activeApplication.role}</p>
            <p className="mt-2 text-xs text-slate-500">
              Applied: {formatDate(activeApplication.dateApplied)}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
