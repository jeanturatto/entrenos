import { getSupabaseClient } from '@/lib/supabase';

export type SpaceMember = {
  userId: string;
  displayName: string;
  isMe: boolean;
};

export type SpaceOverview = {
  id: string;
  name: string;
  members: SpaceMember[];
};

export type EventVisibility = 'private' | 'busy_only' | 'title_only' | 'full';
export type EventResponse = 'pending' | 'accepted' | 'declined' | 'maybe';

export type CalendarEvent = {
  event_id: string;
  event_title: string;
  event_description: string | null;
  event_location: string | null;
  starts_at: string;
  ends_at: string;
  visibility: EventVisibility;
  status: 'proposed' | 'confirmed';
  version: number;
  owner_id: string;
  owner_name: string;
  owned_by_me: boolean;
  my_response: EventResponse;
  partner_response: EventResponse;
};

export type SharedListKind = 'tasks' | 'shopping';
export type SharedRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type SharedItem = {
  item_id: string;
  list_kind: SharedListKind;
  item_title: string;
  item_notes: string | null;
  quantity: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  due_at: string | null;
  recurrence: SharedRecurrence;
  status: 'open' | 'completed';
  version: number;
  created_by: string;
  updated_at: string;
};

type MembershipRow = { space_id: string };
type SpaceRow = { id: string; name: string };
type MemberRow = { user_id: string };
type ProfileRow = { id: string; display_name: string };

function throwIfError(error: { message: string } | null) {
  if (error) {
    throw error;
  }
}

export function getFriendlyCoreError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : String(error);

  if (/already belongs/i.test(message)) return 'Esta conta já participa de um espaço.';
  if (/not found|invalid invitation/i.test(message)) return 'Código de convite inválido.';
  if (/expired/i.test(message)) return 'Este convite expirou. Peça um novo código.';
  if (/two active members/i.test(message)) return 'Este espaço já está completo.';
  if (/changed on another device|changed or cannot/i.test(message)) {
    return 'Este conteúdo foi alterado em outro aparelho. Atualizamos a tela; tente novamente.';
  }
  if (/Create or join/i.test(message)) return 'Conecte o casal antes de usar este recurso.';

  return 'Não foi possível concluir. Verifique sua conexão e tente novamente.';
}

export async function getSpaceOverview(userId: string): Promise<SpaceOverview | null> {
  const supabase = getSupabaseClient();
  const membershipResult = await supabase
    .from('space_members')
    .select('space_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle<MembershipRow>();

  throwIfError(membershipResult.error);
  if (!membershipResult.data) return null;

  const spaceId = membershipResult.data.space_id;
  const [spaceResult, membersResult] = await Promise.all([
    supabase.from('spaces').select('id, name').eq('id', spaceId).single<SpaceRow>(),
    supabase
      .from('space_members')
      .select('user_id')
      .eq('space_id', spaceId)
      .eq('status', 'active')
      .returns<MemberRow[]>(),
  ]);

  throwIfError(spaceResult.error);
  throwIfError(membersResult.error);
  if (!spaceResult.data) throw new Error('Shared space was not found');

  const memberIds = (membersResult.data ?? []).map((member) => member.user_id);
  const profilesResult = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', memberIds)
    .returns<ProfileRow[]>();

  throwIfError(profilesResult.error);
  const profiles = profilesResult.data ?? [];

  return {
    id: spaceResult.data.id,
    name: spaceResult.data.name,
    members: memberIds.map((memberId) => ({
      userId: memberId,
      displayName: profiles.find((profile) => profile.id === memberId)?.display_name ?? 'Pessoa',
      isMe: memberId === userId,
    })),
  };
}

export async function createSpace(name: string) {
  const { data, error } = await getSupabaseClient().rpc('create_space', { space_name: name });
  throwIfError(error);
  return data as string;
}

export async function joinSpace(code: string) {
  const { data, error } = await getSupabaseClient().rpc('join_space_by_code', {
    p_invite_code: code,
  });
  throwIfError(error);
  return data as string;
}

export async function createInvitation(deliveryHint?: string) {
  const { data, error } = await getSupabaseClient().rpc('create_space_invitation', {
    p_delivery_hint: deliveryHint || null,
  });
  throwIfError(error);
  const invitation = (
    data as { invitation_id: string; invite_code: string; expires_at: string }[]
  )[0];
  if (!invitation) throw new Error('Invitation was not created');
  return invitation;
}

export async function cancelInvitation() {
  const { data, error } = await getSupabaseClient().rpc('cancel_space_invitation');
  throwIfError(error);
  return Boolean(data);
}

export async function listCalendarEvents(from: Date, to: Date) {
  const { data, error } = await getSupabaseClient().rpc('list_calendar_events', {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  throwIfError(error);
  return (data ?? []) as CalendarEvent[];
}

export async function createCalendarEvent(input: {
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  visibility: EventVisibility;
}) {
  const { data, error } = await getSupabaseClient().rpc('create_calendar_event', {
    p_title: input.title,
    p_description: input.description,
    p_location: input.location,
    p_starts_at: input.startsAt.toISOString(),
    p_ends_at: input.endsAt.toISOString(),
    p_visibility: input.visibility,
  });
  throwIfError(error);
  return data as string;
}

export async function respondCalendarEvent(
  eventId: string,
  response: Exclude<EventResponse, 'pending'>,
) {
  const { data, error } = await getSupabaseClient().rpc('respond_calendar_event', {
    p_event_id: eventId,
    p_response: response,
    p_note: null,
  });
  throwIfError(error);
  return data as 'proposed' | 'confirmed';
}

export async function cancelCalendarEvent(eventId: string, expectedVersion: number) {
  const { data, error } = await getSupabaseClient().rpc('cancel_calendar_event', {
    p_event_id: eventId,
    p_expected_version: expectedVersion,
  });
  throwIfError(error);
  return Boolean(data);
}

export async function listSharedItems() {
  const { data, error } = await getSupabaseClient().rpc('list_shared_items');
  throwIfError(error);
  return (data ?? []) as SharedItem[];
}

export async function createSharedItem(input: {
  kind: SharedListKind;
  title: string;
  notes: string;
  quantity: string;
  assignedTo: string | null;
  dueAt: Date | null;
  recurrence: SharedRecurrence;
}) {
  const { data, error } = await getSupabaseClient().rpc('create_shared_item', {
    p_kind: input.kind,
    p_title: input.title,
    p_notes: input.notes,
    p_quantity: input.quantity,
    p_assigned_to: input.assignedTo,
    p_due_at: input.dueAt?.toISOString() ?? null,
    p_recurrence: input.recurrence,
  });
  throwIfError(error);
  return data as string;
}

export async function toggleSharedItem(item: SharedItem, completed: boolean) {
  const { data, error } = await getSupabaseClient().rpc('toggle_shared_item', {
    p_item_id: item.item_id,
    p_expected_version: item.version,
    p_completed: completed,
  });
  throwIfError(error);
  return data as number;
}

export async function deleteSharedItem(item: SharedItem) {
  const { data, error } = await getSupabaseClient().rpc('delete_shared_item', {
    p_item_id: item.item_id,
    p_expected_version: item.version,
  });
  throwIfError(error);
  return Boolean(data);
}
