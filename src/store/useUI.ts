import { create } from 'zustand'

interface UIState {
  /** Subscription id being edited, or 'new' while creating a custom one. */
  editor: string | null
  draftName: string
  paletteOpen: boolean
  storyOpen: boolean
  receiptOpen: boolean
  openEditor: (id: string) => void
  openCreate: (name?: string) => void
  closeEditor: () => void
  setPalette: (open: boolean) => void
  setStory: (open: boolean) => void
  setReceipt: (open: boolean) => void
}

export const useUI = create<UIState>()((set) => ({
  editor: null,
  draftName: '',
  paletteOpen: false,
  storyOpen: false,
  receiptOpen: false,
  openEditor: (id) => set({ editor: id, paletteOpen: false }),
  openCreate: (name = '') => set({ editor: 'new', draftName: name, paletteOpen: false }),
  closeEditor: () => set({ editor: null }),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setStory: (storyOpen) => set({ storyOpen, paletteOpen: false }),
  setReceipt: (receiptOpen) => set({ receiptOpen, paletteOpen: false }),
}))
