export default defineAppConfig({
  ui: {
    colors: {
      primary: 'teal',
      neutral: 'stone',
    },
    button: {
      slots: {
        base: 'rounded-[var(--radius-button)] font-semibold inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors',
      },
    },
    input: {
      slots: {
        base: 'w-full rounded-[var(--radius-input)] border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors',
      },
    },
    textarea: {
      slots: {
        base: 'w-full rounded-[var(--radius-input)] border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors',
      },
    },
    card: {
      slots: {
        base: 'group relative block my-5 p-4 sm:p-6 border border-default rounded-[var(--radius-card)] bg-default transition-colors',
      },
    },
  },
})
