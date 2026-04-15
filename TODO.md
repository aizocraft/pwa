# Cart Persistence & Shipping Flow Fixes - TODO

## Status: 🚀 In Progress (0/8 complete)

### Step 1: [✅] Simplify CartItem structure in cart.ts (flatten specs for JSON safety)
### Step 2: [✅] Add robust hydration with validation & fallbacks in cart.ts
### Step 3: [✅] Ensure auto-rehydrate on cart page mount (loadInitialData)
### Step 4: [✅] Fix async safety - await recalculateTotals everywhere
### Step 5: [✅] Add immediate persist after setShippingArea
### Step 6: [✅] Checkout fallback: auto-select if missing but areas available
### Step 7: [✅] UI improvements: disable btns, better validation/feedback
### Step 8: [✅] Test full flow + update this TODO with completion

**Next:** Implement Step 1-2 (cart.ts persistence fixes)

**Testing:** Add to cart → select shipping → reload page → verify persists → checkout → confirm shipping fee in order

