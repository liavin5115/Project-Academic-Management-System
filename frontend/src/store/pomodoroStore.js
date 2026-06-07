import { create } from 'zustand';

export const usePomodoroStore = create((set, get) => ({
  studyTime: 30, // total study time in min
  restTime: 5,   // rest time in min
  sections: 1,   // number of breaks
  selectedCourse: '',
  
  timeLeft: 15 * 60, // studyTime / (sections + 1)
  isActive: false,
  mode: 'study', // 'study' | 'rest'
  currentPart: 1, // 1 to sections+1
  
  setSettings: (study, rest, sections, course) => set({
    studyTime: study,
    restTime: rest,
    sections: sections,
    selectedCourse: course,
    timeLeft: Math.floor((study / (sections + 1)) * 60),
    isActive: false,
    mode: 'study',
    currentPart: 1
  }),
  
  toggleTimer: () => set(state => ({ isActive: !state.isActive })),
  stopTimer: () => set(state => ({
    isActive: false,
    mode: 'study',
    currentPart: 1,
    timeLeft: Math.floor((state.studyTime / (state.sections + 1)) * 60)
  })),
  
  tick: (onSessionComplete, onPhaseChange) => {
    const state = get();
    if (!state.isActive) return;
    
    if (state.timeLeft > 0) {
      set({ timeLeft: state.timeLeft - 1 });
    } else {
      // Time is up!
      if (state.mode === 'study') {
        if (state.currentPart <= state.sections) {
          // Go to rest
          set({ mode: 'rest', timeLeft: state.restTime * 60 });
          if (onPhaseChange) onPhaseChange('rest');
        } else {
          // All parts done!
          set({ isActive: false });
          if (onSessionComplete) {
            onSessionComplete({ duration_minutes: state.studyTime, course_id: state.selectedCourse });
          }
        }
      } else {
        // Rest is over, go to next study part
        set({
          mode: 'study',
          currentPart: state.currentPart + 1,
          timeLeft: Math.floor((state.studyTime / (state.sections + 1)) * 60)
        });
        if (onPhaseChange) onPhaseChange('study');
      }
    }
  }
}));
