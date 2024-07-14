import { create } from 'zustand'

interface PageState {
  bears: number
  increase: (by: number) => void
}

const usePageStore = create<PageState>()(set => ({
  bears: 0,
  increase: by => set(state => ({ bears: state.bears + 1 })),
}))

export default usePageStore
