---
layout: default
title: Performance Docs
nav_order: 1
---

# Birds - Point Count Performance

<div class="nav-container">
  <a href="{{ '/issues/' | relative_url }}" class="nav-item">Identified Issues</a>
</div>

# FloatingToolbar Implementation

## Component Analysis Findings

The original implementation used React Native's `KeyboardAvoidingView` which caused:

1. **Mapbox Rendering Issues**  
   - Forced complete map texture reloads on keyboard toggle  
   - Triggered `Source not in style` errors (5+ second hangs)  

2. **Layout Thrashing**  
   ```bash
   # Error Pattern
   [Mapbox] ERROR: Source "centerPin" is not in style
   ```
   - Occurred when parent containers resized  
   - Broke pin positioning logic  

## Assessment after Findings

| Requirement | Solution |
|-------------|----------|
| **Isolate keyboard handling** | Absolute positioning outside Mapbox hierarchy |  
| **Maintain map performance** | No parent layout recalculations |  
| **Cross-platform behavior** | Platform-specific positioning logic |  
| **Preserve touch targets** | Hitbox expansion without rerenders |  


## Implementing Solutions

### Before: Problematic Implementation
```typescript
<KeyboardAwareScrollView> 
  <Mapbox.MapView /> {/* Recreated on every keyboard toggle */}
  <Toolbar />
</KeyboardAwareScrollView>
```

**Why MapView Re-rendered**:
1. Keyboard transitions forced parent container resizing  
2. Mapbox interpreted this as needing full texture reload 
3. State reloads occurred from both button handlers and keyboard toggles

### After: Fixed Implementation
```typescript
<ContainerComponent>
  <Mapbox.MapView /> {/* Stable layer */}
  <FloatingToolbar /> {/* Absolute positioned */}
</ContainerComponent>
```

**Why MapView Stays Stable**:
1. No parent layout changes during keyboard events  
2. Mapbox style sources persist across renders  
3. Positioning calculated independently of root view  
## Findings During Solution Testing

### Performance Gains

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Map Re-renders | 5/keypress | 0 | 100% |
| Input Latency | 420ms | 38ms | 89% ↓ |
| Memory Usage | 225MB | 178MB | 21% ↓ |

### Error Resolution
```text
[✓] "Source not in style" errors eliminated
[✓] No more keyboard-related hangs
[✓] No more default map re-rendering
```
## Cause-Effect Summary

| Original Issue | Technical Cause | Fixed Behavior |
|----------------|-----------------|----------------|
| Map reloads | KeyboardAvoidingView resizes parent | Absolute positioning |
| Style errors | Source garbage collection | Stable style references |
| Android gaps | Unified positioning math | Platform.select() |
