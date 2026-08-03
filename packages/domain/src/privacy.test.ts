import { describe, expect, it } from 'vitest';

import { discloseEvent, type EventDetails } from './privacy';

const privateEvent: EventDetails = {
  title: 'Consulta médica',
  description: 'Informação sensível',
  location: 'Clínica',
};

describe('discloseEvent', () => {
  it('sempre mostra todos os campos ao proprietário', () => {
    expect(discloseEvent(privateEvent, 'private', true)).toEqual({
      availability: 'busy',
      ...privateEvent,
    });
  });

  it('não revela nenhum detalhe quando a visibilidade é somente ocupado', () => {
    expect(discloseEvent(privateEvent, 'busy_only', false)).toEqual({
      availability: 'busy',
      title: null,
      description: null,
      location: null,
    });
  });

  it('revela apenas o título quando essa permissão foi escolhida', () => {
    expect(discloseEvent(privateEvent, 'title_only', false)).toEqual({
      availability: 'busy',
      title: 'Consulta médica',
      description: null,
      location: null,
    });
  });

  it('revela todos os campos quando o compartilhamento é completo', () => {
    expect(discloseEvent(privateEvent, 'full', false)).toEqual({
      availability: 'busy',
      ...privateEvent,
    });
  });
});
