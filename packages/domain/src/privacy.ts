export const eventVisibilities = ['private', 'busy_only', 'title_only', 'full'] as const;

export type EventVisibility = (typeof eventVisibilities)[number];

export type EventDetails = {
  title: string;
  description: string | null;
  location: string | null;
};

export type DisclosedEvent = {
  availability: 'busy';
  title: string | null;
  description: string | null;
  location: string | null;
};

export function discloseEvent(
  event: EventDetails,
  visibility: EventVisibility,
  viewerIsOwner: boolean,
): DisclosedEvent {
  if (viewerIsOwner || visibility === 'full') {
    return { availability: 'busy', ...event };
  }

  if (visibility === 'title_only') {
    return {
      availability: 'busy',
      title: event.title,
      description: null,
      location: null,
    };
  }

  // `private` e `busy_only` deliberadamente produzem a mesma visão para o parceiro.
  // A diferença é útil para o proprietário e para futuras regras de compartilhamento.
  return {
    availability: 'busy',
    title: null,
    description: null,
    location: null,
  };
}
