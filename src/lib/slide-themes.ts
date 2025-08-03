export interface SlideTheme {
  id: string
  name: string
  description: string
  colors: {
    background: string
    backgroundGradient?: string
    primary: string
    secondary: string
    text: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
  animations: {
    backgroundPattern?: 'floating' | 'geometric' | 'particles' | 'waves' | 'none'
    defaultEntrance: 'fade' | 'slide' | 'zoom' | 'typewriter'
    elementStagger: number // milliseconds between elements
  }
}

export const slideThemes: SlideTheme[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Journey',
    description: 'Deep space theme with purple and blue gradients',
    colors: {
      background: 'from-purple-900 via-blue-900 to-indigo-900',
      backgroundGradient: 'bg-gradient-to-br',
      primary: 'text-white',
      secondary: 'text-gray-300',
      text: 'text-gray-100',
      accent: 'text-purple-400'
    },
    fonts: {
      heading: 'font-bold',
      body: 'font-normal'
    },
    animations: {
      backgroundPattern: 'floating',
      defaultEntrance: 'fade',
      elementStagger: 800
    }
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    description: 'Clean and simple with subtle animations',
    colors: {
      background: 'from-gray-50 to-white',
      backgroundGradient: 'bg-gradient-to-b',
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      text: 'text-gray-600',
      accent: 'text-blue-600'
    },
    fonts: {
      heading: 'font-light',
      body: 'font-light'
    },
    animations: {
      backgroundPattern: 'none',
      defaultEntrance: 'slide',
      elementStagger: 600
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrant Energy',
    description: 'Bold colors with dynamic animations',
    colors: {
      background: 'from-pink-500 via-red-500 to-yellow-500',
      backgroundGradient: 'bg-gradient-to-tr',
      primary: 'text-white',
      secondary: 'text-yellow-100',
      text: 'text-white',
      accent: 'text-yellow-300'
    },
    fonts: {
      heading: 'font-black',
      body: 'font-medium'
    },
    animations: {
      backgroundPattern: 'particles',
      defaultEntrance: 'zoom',
      elementStagger: 500
    }
  },
  {
    id: 'corporate',
    name: 'Professional',
    description: 'Corporate style with blue tones',
    colors: {
      background: 'from-slate-900 to-blue-900',
      backgroundGradient: 'bg-gradient-to-br',
      primary: 'text-white',
      secondary: 'text-blue-200',
      text: 'text-gray-200',
      accent: 'text-blue-400'
    },
    fonts: {
      heading: 'font-semibold',
      body: 'font-normal'
    },
    animations: {
      backgroundPattern: 'geometric',
      defaultEntrance: 'slide',
      elementStagger: 700
    }
  },
  {
    id: 'nature',
    name: 'Natural',
    description: 'Earth tones with organic feel',
    colors: {
      background: 'from-green-800 via-green-700 to-emerald-800',
      backgroundGradient: 'bg-gradient-to-bl',
      primary: 'text-white',
      secondary: 'text-green-100',
      text: 'text-green-50',
      accent: 'text-lime-400'
    },
    fonts: {
      heading: 'font-bold',
      body: 'font-normal'
    },
    animations: {
      backgroundPattern: 'waves',
      defaultEntrance: 'fade',
      elementStagger: 900
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'High contrast dark theme',
    colors: {
      background: 'from-black via-gray-900 to-black',
      backgroundGradient: 'bg-gradient-to-br',
      primary: 'text-white',
      secondary: 'text-gray-400',
      text: 'text-gray-300',
      accent: 'text-indigo-400'
    },
    fonts: {
      heading: 'font-bold',
      body: 'font-light'
    },
    animations: {
      backgroundPattern: 'particles',
      defaultEntrance: 'typewriter',
      elementStagger: 1000
    }
  }
]

export const animationTypes = [
  {
    id: 'dynamic',
    name: 'Dynamic Flow',
    description: 'Elements flow in sync with narration',
    timingMultiplier: 1
  },
  {
    id: 'rapid',
    name: 'Rapid Fire',
    description: 'Quick transitions for energy',
    timingMultiplier: 0.6
  },
  {
    id: 'relaxed',
    name: 'Relaxed Pace',
    description: 'Slower animations for clarity',
    timingMultiplier: 1.5
  },
  {
    id: 'dramatic',
    name: 'Dramatic Reveal',
    description: 'Build suspense with delays',
    timingMultiplier: 2
  }
]

export function getThemeById(themeId: string): SlideTheme {
  return slideThemes.find(theme => theme.id === themeId) || slideThemes[0]
}

export function getAnimationTypeById(animationId: string) {
  return animationTypes.find(type => type.id === animationId) || animationTypes[0]
}