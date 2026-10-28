// One entry per release note, newest first. Only what a customer can use today.
// Dates are ISO (YYYY-MM-DD). No em dashes; build-blog.mjs rejects them.
export default [
  {
    date: '2026-10-28',
    title: 'Retention limits, change detection and named exchanges',
    items: [
      'Uploaded ad server data is kept for set periods: raw files for 30 days, parsed data for 3 months after upload, and everything 30 days after a subscription ends. Uploaded data can be deleted at any time on request.',
      'Starter compares each rescan with the domain\'s last stored scan, so a change to the declared sellers is flagged when the scan runs.',
      'The free scan shows how many premium exchanges are missing from a site\'s declared sellers. Starter names them.',
    ],
  },
];
