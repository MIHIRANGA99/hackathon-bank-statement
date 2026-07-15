// Fixed, decorative blurred gradient mesh rendered once behind the whole
// app — purely visual, no interaction, so it can't affect functionality.
export function AppBackground() {
  return <div className="app-backdrop" aria-hidden="true" />
}
