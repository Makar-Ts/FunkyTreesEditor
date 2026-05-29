export const ON_TABS_CHANGED_EVENT = 'tabs:changed';

export const DEFAULT_PAGE = `/* 
    If you use the copy button on the left (or at 
    the bottom in case you have no variables), 
    comments will be automatically removed from 
    the copied code

    This is just a test code to show the syntax.
*/
|> SmoothFlaps  // < variable name
    ; 0         // < priority (optional, but you need it if you want to define activator)
    ; Activate2 // < activator (optional)
|= Activate1 
    ? -Pitch // no-restrictions mode
    : -Pitch * clamp01((1 - (IAS * 3.6 - 1200)  /  600)) // limit movement at high speeds
                        /* to km/h ^^^   ^^^^ km/h ^^^ 1200 + 600 = 1800 km/h - upper boundary */

|> Field2 |= SmoothFlaps > 0.9 ? 1 : 0
          /* ^^^^^^^^^^^ you can use defined variables in other variables */`