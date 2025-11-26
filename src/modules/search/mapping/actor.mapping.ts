export const actorIndexMapping = {
  settings: {
    analysis: {
      analyzer: {
        vn_analyzer: {
          type: 'custom' as const,
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'], // hỗ trợ tìm kiếm không dấu
        },
      },
    },
  },
  mappings: {
    properties: {
      actorId: { type: 'keyword' as const },
      // SEARCHABLE FIELDS
      actorName: { type: 'text' as const, analyzer: 'vn_analyzer' },
    },
  },
};
