import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { InlineError } from '../../components/ui/InlineError';
import { useToast } from '../../components/ui/useToast';
import {
  getAiErrorMessage,
  getAiParseErrorMessage,
  parseJobDescription,
  suggestResumeBullets,
} from '../ai/ai.api';
import {
  createApplication,
  deleteApplication,
  getApplicationErrorMessage,
  getApplications,
  updateApplication,
} from './applications.api';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { ApplicationForm } from './ApplicationForm';
import { KanbanBoard } from './KanbanBoard';
import type { ApplicationFormInput } from './application.validation';
import type {
  ApplicationStatus,
  JobApplication,
  UpdateApplicationInput,
} from '../../types/application';

const APPLICATIONS_QUERY_KEY = ['applications'] as const;

const toPayload = (input: ApplicationFormInput) => ({
  company: input.company,
  role: input.role,
  jdLink: input.jdLink?.trim() ? input.jdLink.trim() : undefined,
  notes: input.notes?.trim() ? input.notes.trim() : undefined,
  dateApplied: input.dateApplied,
  status: input.status,
  salaryRange: input.salaryRange?.trim() ? input.salaryRange.trim() : undefined,
});

export const ApplicationsSection = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const applicationsQuery = useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: getApplications,
  });

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateApplicationInput }) =>
      updateApplication(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  const moveStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => updateApplication(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: APPLICATIONS_QUERY_KEY });

      const previousApplications = queryClient.getQueryData<JobApplication[]>(
        APPLICATIONS_QUERY_KEY,
      );

      queryClient.setQueryData<JobApplication[]>(
        APPLICATIONS_QUERY_KEY,
        (currentApplications = []) => {
          return currentApplications.map((application) => {
            if (application.id !== id) {
              return application;
            }

            return {
              ...application,
              status,
              updatedAt: new Date().toISOString(),
            };
          });
        },
      );

      return { previousApplications };
    },
    onError: (error, _variables, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(APPLICATIONS_QUERY_KEY, context.previousApplications);
      }

      setPageError(getApplicationErrorMessage(error));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  const parseJobDescriptionMutation = useMutation({
    mutationFn: parseJobDescription,
  });

  const resumeBulletsMutation = useMutation({
    mutationFn: suggestResumeBullets,
  });

  const handleSubmit = async (input: ApplicationFormInput): Promise<void> => {
    setPageError(null);

    try {
      const payload = toPayload(input);
      await createMutation.mutateAsync(payload);
      showToast({
        title: 'Application added',
        message: 'New application has been saved.',
        variant: 'success',
      });
    } catch (error) {
      setPageError(getApplicationErrorMessage(error));
      throw new Error(getApplicationErrorMessage(error));
    }
  };

  const handleDelete = async (applicationId: string): Promise<void> => {
    setPageError(null);

    try {
      await deleteMutation.mutateAsync(applicationId);
      setSelectedApplicationId((currentId) =>
        currentId === applicationId ? null : currentId,
      );
      showToast({
        title: 'Application deleted',
        message: 'The application was removed successfully.',
        variant: 'success',
      });
    } catch (error) {
      setPageError(getApplicationErrorMessage(error));
      throw new Error(getApplicationErrorMessage(error));
    }
  };

  const handleSaveApplication = async (
    applicationId: string,
    payload: UpdateApplicationInput,
  ): Promise<void> => {
    setPageError(null);

    try {
      await updateMutation.mutateAsync({
        id: applicationId,
        payload,
      });
      showToast({
        title: 'Application updated',
        message: 'Your changes have been saved.',
        variant: 'success',
      });
    } catch (error) {
      const message = getApplicationErrorMessage(error);
      setPageError(message);
      throw new Error(message);
    }
  };

  const handleMoveStatus = async (
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<void> => {
    setPageError(null);

    try {
      await moveStatusMutation.mutateAsync({
        id: applicationId,
        status,
      });
      showToast({
        title: 'Status updated',
        message: 'Application moved successfully.',
        variant: 'info',
        durationMs: 1800,
      });
    } catch (error) {
      const message = getApplicationErrorMessage(error);
      setPageError(message);
      throw new Error(message);
    }
  };

  const queryErrorMessage = applicationsQuery.error
    ? getApplicationErrorMessage(applicationsQuery.error)
    : null;

  const applications = applicationsQuery.data ?? [];
  const selectedApplication =
    selectedApplicationId === null
      ? null
      : applications.find((application) => application.id === selectedApplicationId) ?? null;

  const handleParseJobDescription = async (rawText: string) => {
    setPageError(null);

    try {
      const result = await parseJobDescriptionMutation.mutateAsync({
        jobDescriptionText: rawText,
      });

      showToast({
        title: 'Description parsed',
        message: 'AI extracted job fields successfully.',
        variant: 'success',
      });

      return result;
    } catch (error) {
      const message = getAiParseErrorMessage(error);
      setPageError(message);
      throw new Error(message);
    }
  };

  const handleGenerateResumeBullets = async (role: string, skills: string[]) => {
    setPageError(null);

    try {
      const result = await resumeBulletsMutation.mutateAsync({
        role,
        skills,
      });

      showToast({
        title: 'Bullets generated',
        message: 'AI suggestions are ready below the form.',
        variant: 'success',
      });

      return result.bullets;
    } catch (error) {
      const message = getAiErrorMessage(error);
      setPageError(message);
      throw new Error(message);
    }
  };

  return (
    <div className="space-y-6">
      <ApplicationForm
        key="new-application"
        editingApplication={null}
        isSubmitting={createMutation.isPending}
        isParsingJobDescription={parseJobDescriptionMutation.isPending}
        isGeneratingResumeBullets={resumeBulletsMutation.isPending}
        onSubmit={handleSubmit}
        onCancelEdit={() => undefined}
        onParseJobDescription={handleParseJobDescription}
        onGenerateResumeBullets={handleGenerateResumeBullets}
      />

      {pageError || queryErrorMessage ? (
        <InlineError message={pageError ?? queryErrorMessage ?? 'Unknown error'} />
      ) : null}

      <KanbanBoard
        applications={applications}
        isLoading={applicationsQuery.isLoading}
        isMovingStatus={moveStatusMutation.isPending}
        onMoveStatus={handleMoveStatus}
        onCardClick={setSelectedApplicationId}
      />

      {selectedApplication ? (
        <ApplicationDetailsModal
          key={selectedApplication.id}
          application={selectedApplication}
          isSaving={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onClose={() => setSelectedApplicationId(null)}
          onSave={handleSaveApplication}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  );
};
