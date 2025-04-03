---
title: Identified Issues
permalink: /issues/
nav_order: 1
---

<div class="nav-container">
  <a href="{{ site.baseurl }}/" class="nav-item">← Back to Main</a>
</div>

# PointCountMapStep Performance Discovery

## Key Performance Bottlenecks

### 1. Form State Management
**Issue**: Chained state updates caused layout thrashing  
**Symptoms**: 300-500ms input latency, map flickering  
**Solution**: Consolidated to batched updates (40% reduction)

### 2. Mapbox Pin Rendering
**Root Cause**: `flexGrow` conflicts with Mapbox layout  
**Symptoms**: Disappearing pins, CPU spikes during input  
**Solution**: Created isolated `FloatingToolbar` component

### 3. Invalid Pin Handling
**Anti-Pattern**: Validation blocked data loading  
**Symptoms**: Blank forms for invalid entries  
**Solution**: Decoupled validation from rendering

## Critical Component Interactions

| Component | Conflict | Impact | Resolution |
|-----------|---------|--------|------------|
| KeyboardAwareScrollView | flexGrow propagation | Mapbox re-renders | Absolute positioning |
| PointCountSpeciesDataEntryCard | Unbatched setStates | Input lag | React unstable_batchedUpdates |
| Mapbox SymbolLayer | Parent layout changes | Pin position errors | Isolated rendering context |

## Architectural Insights

1. **Mapbox Golden Rules**:
   - Never nest in flex containers
   - Avoid synchronous style updates
   - Isolate touch handlers

2. **Form State Lessons**:
   - Invalid states must persist through renders
   - Validation ≠ data filtering
   - Always batch related updates
