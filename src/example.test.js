import { describe, it, expect } from 'vitest';

describe('Базові тести системи (Dummy Tests)', () => {
  
  it('математика в JavaScript працює коректно', () => {
    expect(2 + 2).toBe(4);
  });

  it('назва проєкту зберігається правильно', () => {
    const project = { name: 'Slush Store' };
    expect(project.name).toBe('Slush Store');
  });

});