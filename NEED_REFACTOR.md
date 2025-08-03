# Refactoring Priority List for makeitvid

## 📊 Refactoring Progress Summary

**Overall Progress: 1/4 Critical Files Refactored (25%)**

- ✅ **Completed**: 1 file (create/page.tsx - reduced from 695 to 242 lines)
- 🚨 **Remaining Critical**: 3 files (>300 lines each) - excluding shadcn/ui components
- ⚠️ **Remaining Medium**: 1 file (200-300 lines)
- **Total Lines Reduced**: 453 lines (65% reduction on refactored files)

> **Note**: All files in `src/components/ui/` are shadcn/ui components and are excluded from refactoring.

## ✅ Completed Refactoring

### 1. `/src/app/create/page.tsx` ~~(695 lines)~~ → **242 lines** ✅ - **COMPLETED**
**Refactoring Summary:**
- Reduced from 695 to 242 lines (65% reduction)
- Extracted 3 custom hooks for state management
- Created 4 reusable components
- Achieved clean separation of concerns

**New Structure:**
```
src/
├── hooks/create-page/
│   ├── useProjectManagement.ts (92 lines)
│   ├── useVideoGeneration.ts (126 lines)
│   ├── useAudioGeneration.ts (132 lines)
│   └── index.ts (4 lines)
└── components/create-page/
    ├── ProjectHeader.tsx (44 lines)
    ├── ContentInputSection.tsx (143 lines)
    ├── GenerationProgress.tsx (24 lines)
    ├── ScriptSectionsList.tsx (134 lines)
    └── index.ts (4 lines)
```

## 🚨 Remaining Critical Refactoring Needs (Files > 300 lines)

### 1. `/src/components/enhanced-slide-preview-modal.tsx` (413 lines) - **HIGHEST PRIORITY**
**Issues:**
- Complex modal component with too many responsibilities
- Animation logic mixed with UI rendering
- Multiple rendering functions within component
- Complex state management for animations

**Recommended Refactoring:**
- Extract animation logic to custom hook `useSlideAnimations`
- Create separate components for different slide types
- Extract visual element renderers
- Move background pattern rendering to separate component

### 2. `/src/components/html-slide-preview-modal.tsx` (391 lines) - **HIGH PRIORITY**
**Issues:**
- Similar issues to enhanced preview modal
- Complex iframe manipulation logic
- Mixed concerns of UI and content transformation

**Recommended Refactoring:**
- Extract iframe management to custom hook `useIframeScaling`
- Create separate component for audio controls
- Move HTML processing logic to utility functions
- Extract scaling calculations to separate module

### 3. `/src/lib/ai/gemini.ts` (365 lines) - **MEDIUM PRIORITY**
**Issues:**
- Long AI integration file with embedded prompts
- Complex HTML generation logic
- Hardcoded styling and animations
- Large prompt template embedded in code

**Recommended Refactoring:**
- Extract prompt templates to separate files
- Create HTML template builder class
- Move CSS generation to separate module
- Create animation configuration system

### 4. `/src/app/page.tsx` (340 lines) - **LOW PRIORITY**
**Issues:**
- Landing page with all sections in one component
- Repetitive section structures

**Recommended Refactoring:**
- Extract section components:
  - `HeroSection`
  - `FeaturesSection`
  - `HowItWorksSection`
  - `OpenSourceSection`
  - `CTASection`
- Create reusable `FeatureCard` component

## 📊 Medium Priority Refactoring (200-300 lines)

### 5. `/src/lib/ai/gemini-tts.ts` (292 lines)
**Issues:**
- Mixed responsibilities: API integration + audio processing
- WAV conversion utilities embedded

**Recommended Refactoring:**
- Extract WAV conversion utilities to separate file
- Create audio processing service
- Separate voice configuration management

## 🎯 General Refactoring Recommendations

### 1. **Create Service Layer**
```
src/services/
├── videoGeneration.service.ts
├── audioGeneration.service.ts
├── projectStorage.service.ts
└── aiIntegration.service.ts
```

### 2. **Implement Custom Hooks Pattern**
```
src/hooks/
├── useVideoGeneration.ts
├── useProjectManagement.ts
├── useAudioPlayer.ts
└── useAnimationSequence.ts
```

### 3. **Component Organization**
```
src/components/
├── create/
│   ├── ContentInput.tsx
│   ├── GenerationProgress.tsx
│   └── ScriptSectionList.tsx
├── preview/
│   ├── SlidePreview.tsx
│   ├── AudioControls.tsx
│   └── AnimationRenderer.tsx
└── shared/
    ├── LoadingStates.tsx
    └── ErrorBoundary.tsx
```

### 4. **State Management**
- Consider implementing Zustand or Context API for global state
- Move complex state logic out of components
- Create dedicated stores for:
  - Project management
  - Generation status
  - User preferences

### 5. **API Layer Abstraction**
```
src/lib/api/
├── gemini/
│   ├── client.ts
│   ├── types.ts
│   └── prompts/
├── cartesia/
└── storage/
```

## 🚀 Updated Implementation Priority

### ✅ Phase 1 (Completed):
- ✅ Refactored `/src/app/create/page.tsx` - reduced from 695 to 242 lines
- ✅ Extracted custom hooks for state management
- ✅ Created reusable components

### 🔄 Phase 2 (Next - High Priority):
1. **Refactor preview modals** (400+ lines each):
   - `/src/components/html-slide-preview-modal.tsx`
   - `/src/components/enhanced-slide-preview-modal.tsx`
   - Extract animation and iframe logic to custom hooks
   - Create separate components for audio controls

### 📋 Phase 3 (Medium Priority):
- Refactor `/src/lib/ai/gemini.ts` (365 lines)
- Create service layer for API calls
- Implement proper state management (Zustand/Context)

### 🎯 Phase 4 (Low Priority):
- Refactor landing page (`/src/app/page.tsx`)
- Optimize UI component library usage
- Create comprehensive testing suite

## 📝 Notes

- **IMPORTANT**: All components in `src/components/ui/` are shadcn/ui library components and should NOT be refactored
- Files excluded from refactoring:
  - `/src/components/ui/sidebar.tsx` (726 lines) - shadcn/ui component
  - `/src/components/ui/chart.tsx` (353 lines) - shadcn/ui component
  - `/src/components/ui/menubar.tsx` (276 lines) - shadcn/ui component
  - `/src/components/ui/dropdown-menu.tsx` (257 lines) - shadcn/ui component
  - `/src/components/ui/context-menu.tsx` (252 lines) - shadcn/ui component
  - All other files in `/src/components/ui/`
- Focus on business logic separation first
- Ensure backward compatibility during refactoring
- Add proper TypeScript types during refactoring
- Consider adding error boundaries for better error handling
- Document new patterns and structures as you implement them