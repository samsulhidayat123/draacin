import { sortServers } from '../lib/playerSecurity';

describe('Player Security - Server Sorting', () => {
  it('should prioritize VIDSRC domains over fallback servers like ST or VDZ', () => {
    const mockServers = [
      { name: 'ST', embedUrl: 'https://streamtape.com/e/123' },
      { name: 'VDZ', embedUrl: 'https://vidoza.net/embed-123.html' },
      { name: 'VIDSRC SU', embedUrl: 'https://vidsrc-embed.su/embed/movie/123' },
    ];

    // Mengurutkan server menggunakan fungsi yang diperbarui
    const sorted = sortServers(mockServers);
    
    // Ekspektasi: VIDSRC SU harus otomatis menjadi urutan ke-1 (index 0)
    expect(sorted.length).toBe(3);
    expect(sorted[0].name).toBe('VIDSRC SU');
    expect(sorted[1].name).toBe('ST');
    expect(sorted[2].name).toBe('VDZ');
  });
});