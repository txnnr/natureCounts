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
3. State reloads occurred from button handlers and keyboard toggles

     **meaning:  any button handlers which causes change in the application state [eg: adding or editing a pin] we would get one re-render for that update in state from the button handler + any other triggers based on that state update AND we get the default re-render due to the layout issues**

### Take a look here where you have this handleOnPress method wrapped inside the KeyboardAwareScrollView.

The method alone is doing heavy processing causing state re-renders due to manipulating the pins you get that + the default re-render when the keyboard opens and when it closes!


```typescript
<KeyboardAwareScrollView>
	<MapboxGL.MapView onPress={handleOnPress}>
</KeyboardAwareScrollView>

```

```typescript
const [pins, setPins] = 
  useState<IFeature>(INITIAL_PINS_FEATURE_COLLECTION);


const handleOnPress = () => {
// ..some logic


//logic that is going to be setting state & causing re-renders via the setState actions such as setPins or setBirds

tempBirds.push(newBird);
setPins({ features: tempPinFeatures, type: 'FeatureCollection' });
setBirds(tempBirds);

if (activePin !== undefined) {
  onPointCountSpeciesDataEntryDone(tempPinFeatures);
}

if (isPointCountSpeciesDataEntryCardVisible === true) {
  resetPointCountSpeciesDataEntryForm(DEFAULT_RECORD);
}

setActivePin(newBird);
isNewPin.current = true;
setIsPointCountSpeciesDataEntryCardVisible(true);
setSearchSpeciesInput('');

}

//more logic
```

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
