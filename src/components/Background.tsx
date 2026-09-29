export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div
        className="absolute -top-[28vmax] -left-[18vmax] size-[72vmax] animate-drift-a rounded-full opacity-[0.3]"
        style={{ background: 'radial-gradient(closest-side, var(--heat-a), transparent)' }}
      />
      <div
        className="absolute -top-[14vmax] -right-[22vmax] size-[68vmax] animate-drift-b rounded-full opacity-[0.24]"
        style={{ background: 'radial-gradient(closest-side, var(--heat-b), transparent)' }}
      />
      <div
        className="absolute top-[45vh] left-[18vw] size-[62vmax] animate-drift-c rounded-full opacity-[0.14]"
        style={{ background: 'radial-gradient(closest-side, var(--heat-c), transparent)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, black 20%, transparent 75%)',
        }}
      />
      <div className="grain absolute inset-0 opacity-[0.09] mix-blend-overlay" />
    </div>
  )
}
