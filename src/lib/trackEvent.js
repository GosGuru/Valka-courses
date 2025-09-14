// Simple analytics wrapper for Google Analytics (gtag) & fallback console
export function trackEvent(eventName, params = {}) {
  try {
    if (window.gtag) {
      window.gtag('event', eventName, params);
    } else {
      // fallback
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[trackEvent]', eventName, params);
      }
    }
  } catch (e) {
    // swallow
  }
}

export function trackProgramView(program) {
  trackEvent('view_program', { program_id: program.id, name: program.name });
}

export function trackLessonView(lesson) {
  trackEvent('view_lesson', { lesson_id: lesson.id, title: lesson.title });
}

export function trackEnroll(program, method = 'direct') {
  trackEvent('enroll_program', { program_id: program.id, name: program.name, method });
}

export function trackPlayVideo(lesson) {
  trackEvent('play_video', { lesson_id: lesson.id, title: lesson.title });
}
