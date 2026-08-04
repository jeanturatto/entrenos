import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radii, spacing } from '@/constants/theme';
import { useAppTheme } from '@/design-system/theme-provider';
import type { CalendarEvent } from '@/features/core/api';
import {
  dateKey,
  eventDurationMinutes,
  eventsForDay,
  formatDayHeading,
  formatEventTime,
  formatShortDay,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  minutesFromStartOfDay,
  weekdayLabels,
} from '@/features/calendar/calendar-utils';

type CalendarViewProps = {
  events: CalendarEvent[];
  cursor: Date;
  selectedDate: Date;
  selectedEventId?: string;
  compact: boolean;
  partnerName?: string;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
};

const hourHeight = 64;
const firstHour = 7;
const lastHour = 24;
const timelineHours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);

function useEventColor(event: CalendarEvent) {
  const { colors } = useAppTheme();
  if (event.status === 'proposed') return colors.calendarProposal;
  if (event.visibility === 'full') return colors.calendarShared;
  return event.owned_by_me ? colors.calendarMine : colors.calendarPartner;
}

function EventPill({
  event,
  compact,
  selected,
  onPress,
}: {
  event: CalendarEvent;
  compact?: boolean;
  selected?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const eventColor = useEventColor(event);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${formatEventTime(event.starts_at)} ${event.event_title}`}
      onPress={(pressEvent) => {
        pressEvent.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [
        styles.eventPill,
        compact ? styles.eventPillCompact : null,
        {
          backgroundColor: `${eventColor}${selected ? '2f' : '1c'}`,
          borderLeftColor: eventColor,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      {!compact ? (
        <Text numberOfLines={1} style={[styles.eventTime, { color: eventColor }]}>
          {formatEventTime(event.starts_at)}
        </Text>
      ) : null}
      <Text numberOfLines={1} style={[styles.eventTitle, { color: colors.text }]}>
        {event.event_title}
      </Text>
    </Pressable>
  );
}

export function MonthCalendar(props: CalendarViewProps) {
  const { colors } = useAppTheme();
  const days = getMonthGridDays(props.cursor);
  const today = new Date();

  return (
    <View
      style={[
        styles.calendarFrame,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.weekdayHeader, { borderColor: colors.border }]}>
        {weekdayLabels.map((label) => (
          <Text key={label} style={[styles.weekdayLabel, { color: colors.textMuted }]}>
            {props.compact ? label.slice(0, 1) : label}
          </Text>
        ))}
      </View>
      <View style={styles.monthGrid}>
        {days.map((day) => {
          const dayEvents = eventsForDay(props.events, day);
          const outsideMonth = day.getMonth() !== props.cursor.getMonth();
          const selected = isSameDay(day, props.selectedDate);
          const isToday = isSameDay(day, today);
          return (
            <View
              key={dateKey(day)}
              style={[
                styles.monthCell,
                props.compact ? styles.monthCellCompact : null,
                {
                  borderColor: colors.border,
                  backgroundColor: selected
                    ? `${colors.brand}0d`
                    : colors.surface,
                },
              ]}
            >
              <View style={styles.dayNumberRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={formatDayHeading(day)}
                  onPress={() => props.onSelectDate(day)}
                  style={[
                    styles.dayNumberBadge,
                    isToday ? { backgroundColor: colors.brandStrong } : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: isToday
                          ? colors.onBrand
                          : outsideMonth
                            ? colors.textMuted
                            : colors.text,
                      },
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              </View>
              {props.compact ? (
                <View style={styles.compactDots}>
                  {dayEvents.slice(0, 4).map((event) => (
                    <View
                      key={event.event_id}
                      style={[
                        styles.eventDot,
                        {
                          backgroundColor:
                            event.status === 'proposed'
                              ? colors.calendarProposal
                              : event.visibility === 'full'
                                ? colors.calendarShared
                                : event.owned_by_me
                                  ? colors.calendarMine
                                  : colors.calendarPartner,
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.dayEvents}>
                  {dayEvents.slice(0, 3).map((event) => (
                    <EventPill
                      key={event.event_id}
                      event={event}
                      selected={event.event_id === props.selectedEventId}
                      onPress={() => props.onSelectEvent(event)}
                    />
                  ))}
                  {dayEvents.length > 3 ? (
                    <Text style={[styles.moreEvents, { color: colors.textMuted }]}>
                      +{dayEvents.length - 3} compromissos
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TimelineEvent({
  event,
  onPress,
  selected,
}: {
  event: CalendarEvent;
  onPress: () => void;
  selected?: boolean;
}) {
  const { colors } = useAppTheme();
  const eventColor = useEventColor(event);
  const startMinutes = Math.max(firstHour * 60, minutesFromStartOfDay(event.starts_at));
  const top = ((startMinutes - firstHour * 60) / 60) * hourHeight;
  const height = Math.max(34, (eventDurationMinutes(event) / 60) * hourHeight - 4);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.timelineEvent,
        {
          top,
          height,
          backgroundColor: `${eventColor}${selected ? '36' : '25'}`,
          borderColor: eventColor,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Text numberOfLines={1} style={[styles.timelineEventTitle, { color: colors.text }]}>
        {event.event_title}
      </Text>
      {height >= 50 ? (
        <Text numberOfLines={1} style={[styles.timelineEventTime, { color: colors.textMuted }]}>
          {formatEventTime(event.starts_at)}–{formatEventTime(event.ends_at)}
        </Text>
      ) : null}
    </Pressable>
  );
}

function TimelineHourAxis() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.hourAxis}>
      {timelineHours.map((hour) => (
        <Text
          key={hour}
          style={[
            styles.hourLabel,
            { color: colors.textMuted, top: (hour - firstHour) * hourHeight - 8 },
          ]}
        >
          {`${hour}`.padStart(2, '0')}:00
        </Text>
      ))}
    </View>
  );
}

function HourLines() {
  const { colors } = useAppTheme();
  return (
    <>
      {timelineHours.map((hour) => (
        <View
          key={hour}
          style={[
            styles.hourLine,
            { top: (hour - firstHour) * hourHeight, backgroundColor: colors.border },
          ]}
        />
      ))}
    </>
  );
}

export function WeekCalendar(props: CalendarViewProps) {
  const { colors } = useAppTheme();
  const days = getWeekDays(props.cursor);
  const minWidth = props.compact ? 820 : undefined;

  return (
    <ScrollView
      horizontal
      scrollEnabled={props.compact}
      showsHorizontalScrollIndicator={props.compact}
      contentContainerStyle={props.compact ? undefined : styles.timelineScrollContent}
    >
      <View
        style={[
          styles.timelineFrame,
          { minWidth, backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[styles.timelineHeader, { borderColor: colors.border }]}>
          <View style={styles.hourAxisHeader} />
          {days.map((day) => (
            <Pressable
              key={dateKey(day)}
              onPress={() => props.onSelectDate(day)}
              style={[styles.timelineDayHeader, { borderColor: colors.border }]}
            >
              <Text style={[styles.timelineWeekday, { color: colors.textMuted }]}>
                {weekdayLabels[day.getDay()]}
              </Text>
              <View
                style={[
                  styles.timelineDateBadge,
                  isSameDay(day, new Date()) ? { backgroundColor: colors.brandStrong } : null,
                ]}
              >
                <Text
                  style={[
                    styles.timelineDate,
                    { color: isSameDay(day, new Date()) ? colors.onBrand : colors.text },
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        <View style={[styles.timelineBody, { height: timelineHours.length * hourHeight }]}>
          <TimelineHourAxis />
          <View style={styles.weekColumns}>
            {days.map((day) => (
              <View key={dateKey(day)} style={[styles.weekColumn, { borderColor: colors.border }]}>
                <HourLines />
                {eventsForDay(props.events, day).map((event) => (
                  <TimelineEvent
                    key={event.event_id}
                    event={event}
                    selected={event.event_id === props.selectedEventId}
                    onPress={() => props.onSelectEvent(event)}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function DayCalendar(props: CalendarViewProps) {
  const { colors } = useAppTheme();
  const dayEvents = eventsForDay(props.events, props.cursor);
  const myEvents = dayEvents.filter((event) => event.visibility !== 'full' && event.owned_by_me);
  const partnerEvents = dayEvents.filter(
    (event) => event.visibility !== 'full' && !event.owned_by_me,
  );
  const sharedEvents = dayEvents.filter((event) => event.visibility === 'full');

  return (
    <ScrollView
      horizontal
      scrollEnabled={props.compact}
      showsHorizontalScrollIndicator={props.compact}
      contentContainerStyle={props.compact ? undefined : styles.timelineScrollContent}
    >
      <View
        style={[
          styles.timelineFrame,
          {
            minWidth: props.compact ? 680 : undefined,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.timelineHeader, { borderColor: colors.border }]}>
          <View style={styles.hourAxisHeader} />
          <View style={[styles.personHeader, { borderColor: colors.border }]}>
            <View style={[styles.personDot, { backgroundColor: colors.calendarMine }]} />
            <View>
              <Text style={[styles.personTitle, { color: colors.text }]}>Você</Text>
              <Text style={[styles.personMeta, { color: colors.textMuted }]}>Sua agenda</Text>
            </View>
          </View>
          <View style={[styles.personHeader, { borderColor: colors.border }]}>
            <View style={[styles.personDot, { backgroundColor: colors.calendarPartner }]} />
            <View>
              <Text style={[styles.personTitle, { color: colors.text }]}>
                {' '}
                {props.partnerName ?? 'Seu par'}
              </Text>
              <Text style={[styles.personMeta, { color: colors.textMuted }]}>
                Agenda compartilhada
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.timelineBody, { height: timelineHours.length * hourHeight }]}>
          <TimelineHourAxis />
          <View style={styles.dayColumnsWrap}>
            <HourLines />
            <View style={styles.dayColumns}>
              <View style={[styles.personColumn, { borderColor: colors.border }]}>
                {myEvents.map((event) => (
                  <TimelineEvent
                    key={event.event_id}
                    event={event}
                    selected={event.event_id === props.selectedEventId}
                    onPress={() => props.onSelectEvent(event)}
                  />
                ))}
              </View>
              <View style={[styles.personColumn, { borderColor: colors.border }]}>
                {partnerEvents.map((event) => (
                  <TimelineEvent
                    key={event.event_id}
                    event={event}
                    selected={event.event_id === props.selectedEventId}
                    onPress={() => props.onSelectEvent(event)}
                  />
                ))}
              </View>
            </View>
            <View pointerEvents="box-none" style={styles.sharedOverlay}>
              {sharedEvents.map((event) => (
                <TimelineEvent
                  key={event.event_id}
                  event={event}
                  selected={event.event_id === props.selectedEventId}
                  onPress={() => props.onSelectEvent(event)}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function AgendaList(props: CalendarViewProps) {
  const { colors } = useAppTheme();
  const grouped = props.events.reduce<Record<string, CalendarEvent[]>>((accumulator, event) => {
    const key = dateKey(event.starts_at);
    accumulator[key] = [...(accumulator[key] ?? []), event];
    return accumulator;
  }, {});
  const keys = Object.keys(grouped).sort();

  if (keys.length === 0) {
    return (
      <View
        style={[
          styles.agendaEmpty,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.agendaEmptyTitle, { color: colors.text }]}>
          Nenhum compromisso neste período
        </Text>
        <Text style={[styles.agendaEmptyBody, { color: colors.textMuted }]}>
          Sua agenda está livre nos próximos 90 dias.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.agendaList, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {keys.map((key) => {
        const day = new Date(`${key}T12:00:00`);
        return (
          <View key={key} style={[styles.agendaGroup, { borderColor: colors.border }]}>
            <View style={styles.agendaDate}>
              <Text style={[styles.agendaDateNumber, { color: colors.text }]}>{day.getDate()}</Text>
              <Text style={[styles.agendaDateLabel, { color: colors.textMuted }]}>
                {formatShortDay(day).split(' ')[1]}
              </Text>
            </View>
            <View style={styles.agendaEvents}>
              {grouped[key].map((event) => (
                <EventPill
                  key={event.event_id}
                  event={event}
                  selected={event.event_id === props.selectedEventId}
                  onPress={() => props.onSelectEvent(event)}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarFrame: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  weekdayHeader: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: {
    width: `${100 / 7}%`,
    minHeight: 124,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  monthCellCompact: { minHeight: 68, padding: 2 },
  dayNumberRow: { alignItems: 'flex-end' },
  dayNumberBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: { fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
  dayEvents: { gap: 3 },
  eventPill: {
    minHeight: 25,
    borderLeftWidth: 3,
    borderRadius: radii.xs,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventPillCompact: { minHeight: 23 },
  eventTime: { fontSize: 10, fontWeight: '900', fontVariant: ['tabular-nums'] },
  eventTitle: { flex: 1, minWidth: 0, fontSize: 11, fontWeight: '700' },
  moreEvents: { fontSize: 10, fontWeight: '700', paddingHorizontal: 4 },
  compactDots: {
    minHeight: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
  },
  eventDot: { width: 5, height: 5, borderRadius: 3 },
  timelineFrame: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  timelineScrollContent: { width: '100%' },
  timelineHeader: { height: 72, flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  hourAxisHeader: { width: 58 },
  timelineDayHeader: {
    flex: 1,
    minWidth: 95,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  timelineWeekday: { fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
  timelineDateBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDate: { fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timelineBody: { flexDirection: 'row', position: 'relative' },
  hourAxis: { width: 58, position: 'relative' },
  hourLabel: {
    position: 'absolute',
    right: 9,
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  weekColumns: { flex: 1, flexDirection: 'row' },
  weekColumn: {
    flex: 1,
    minWidth: 95,
    position: 'relative',
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  hourLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  timelineEvent: {
    position: 'absolute',
    zIndex: 2,
    left: 4,
    right: 4,
    borderLeftWidth: 3,
    borderRadius: radii.xs,
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  timelineEventTitle: { fontSize: 11, lineHeight: 15, fontWeight: '800' },
  timelineEventTime: { fontSize: 9, lineHeight: 13, fontVariant: ['tabular-nums'] },
  personHeader: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  personDot: { width: 10, height: 10, borderRadius: 5 },
  personTitle: { fontSize: 13, fontWeight: '800' },
  personMeta: { fontSize: 10, marginTop: 2 },
  dayColumnsWrap: { flex: 1, position: 'relative' },
  dayColumns: { flex: 1, flexDirection: 'row' },
  personColumn: { flex: 1, position: 'relative', borderLeftWidth: StyleSheet.hairlineWidth },
  sharedOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 4 },
  agendaList: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radii.md, overflow: 'hidden' },
  agendaGroup: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  agendaDate: { width: 48, alignItems: 'center' },
  agendaDateNumber: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  agendaDateLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  agendaEvents: { flex: 1, minWidth: 0, gap: spacing.xs },
  agendaEmpty: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  agendaEmptyTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  agendaEmptyBody: { fontSize: 14, textAlign: 'center' },
});
