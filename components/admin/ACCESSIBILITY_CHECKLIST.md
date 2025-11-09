# Admin Panel Accessibility Testing Checklist

Use this checklist to verify accessibility compliance for the admin panel.

## ✅ Keyboard Navigation

### General Navigation
- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order is logical and follows visual layout
- [ ] Shift+Tab navigates backwards correctly
- [ ] Focus indicators are visible on all interactive elements
- [ ] No keyboard traps exist (can always navigate away)
- [ ] Skip to main content link works (appears on Tab)

### Sidebar Navigation
- [ ] Can navigate through all menu items with Tab
- [ ] Enter/Space activates menu items
- [ ] Active page is indicated visually and with aria-current
- [ ] Back to App button is keyboard accessible
- [ ] Mobile menu toggle is keyboard accessible

### Tables
- [ ] Can navigate to sortable column headers with Tab
- [ ] Enter or Space activates sorting
- [ ] Sort direction is announced to screen readers
- [ ] Can navigate to clickable rows with Tab
- [ ] Enter or Space opens row details

### Forms and Inputs
- [ ] All form inputs are keyboard accessible
- [ ] Can clear search input with keyboard
- [ ] Dropdown menus open with Enter/Space
- [ ] Arrow keys navigate dropdown options
- [ ] Escape closes dropdowns
- [ ] Selected option is announced

### Modals and Dialogs
- [ ] Modal opens and focus moves to modal
- [ ] Can navigate through modal content with Tab
- [ ] Escape closes modal
- [ ] Focus returns to trigger element after closing
- [ ] Cannot Tab outside of modal (focus trap)

## ✅ ARIA Labels and Roles

### Landmarks
- [ ] Main content has role="main"
- [ ] Navigation has role="navigation" and aria-label
- [ ] Search has role="search"
- [ ] Complementary content has role="complementary"

### Interactive Elements
- [ ] All buttons have descriptive aria-label or text
- [ ] Icon-only buttons have aria-label
- [ ] Decorative icons have aria-hidden="true"
- [ ] Links have descriptive text or aria-label

### Dynamic Content
- [ ] Loading states have role="status" and aria-live="polite"
- [ ] Error messages have role="alert"
- [ ] Toast notifications have role="alert" and aria-live="assertive"
- [ ] Live regions update properly

### Tables
- [ ] Tables have role="table"
- [ ] Sortable columns have aria-sort attribute
- [ ] Column headers have proper scope

### Dialogs
- [ ] Modals have role="dialog" and aria-modal="true"
- [ ] Dialogs have aria-labelledby and aria-describedby
- [ ] Confirm dialogs have proper labeling

### Form Controls
- [ ] All inputs have associated labels
- [ ] Required fields are marked with aria-required
- [ ] Invalid fields have aria-invalid="true"
- [ ] Error messages are associated with inputs

## ✅ Color Contrast

### Text Contrast
- [ ] Normal text (< 18pt) has 4.5:1 contrast ratio
- [ ] Large text (≥ 18pt) has 3:1 contrast ratio
- [ ] Link text has 4.5:1 contrast ratio
- [ ] Placeholder text has 4.5:1 contrast ratio

### Interactive Elements
- [ ] Button text has 4.5:1 contrast ratio
- [ ] Icon buttons have 3:1 contrast ratio
- [ ] Focus indicators have 3:1 contrast ratio
- [ ] Disabled elements have sufficient contrast

### Status Colors
- [ ] Success messages (green) have sufficient contrast
- [ ] Error messages (red) have sufficient contrast
- [ ] Warning messages (yellow) have sufficient contrast
- [ ] Info messages (blue) have sufficient contrast

### Charts and Graphs
- [ ] Chart colors are distinguishable
- [ ] Chart text has sufficient contrast
- [ ] Chart legends are readable
- [ ] Alternative text describes chart data

## ✅ Focus Indicators

### Visibility
- [ ] Focus indicators are visible on all interactive elements
- [ ] Focus indicators have 2px minimum width
- [ ] Focus indicators have 3:1 contrast ratio
- [ ] Focus indicators are not obscured by other elements

### Consistency
- [ ] Focus indicators are consistent across components
- [ ] Focus indicators match design system
- [ ] Custom focus styles are applied correctly

### Special Cases
- [ ] Table rows have focus indicators
- [ ] Dropdown options have focus indicators
- [ ] Modal elements have focus indicators
- [ ] Chart interactive elements have focus indicators

## ✅ Screen Reader Testing

### Navigation
- [ ] Page title is announced
- [ ] Landmarks are announced correctly
- [ ] Navigation structure is clear
- [ ] Current page is announced

### Content
- [ ] All text content is announced
- [ ] Images have alt text or are marked decorative
- [ ] Icons are properly labeled or hidden
- [ ] Abbreviations are expanded

### Forms
- [ ] Form labels are announced
- [ ] Required fields are announced
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Helper text is associated with inputs

### Dynamic Content
- [ ] Loading states are announced
- [ ] Content updates are announced
- [ ] Error states are announced
- [ ] Success states are announced

### Tables
- [ ] Table structure is announced
- [ ] Column headers are announced
- [ ] Row data is announced correctly
- [ ] Sort state is announced

### Charts
- [ ] Chart type is announced
- [ ] Chart data summary is provided
- [ ] Chart values are accessible
- [ ] Alternative data representation exists

## ✅ Touch Targets

### Size
- [ ] All interactive elements are at least 44x44 pixels
- [ ] Buttons meet minimum size requirements
- [ ] Links meet minimum size requirements
- [ ] Form controls meet minimum size requirements

### Spacing
- [ ] Adequate spacing between interactive elements
- [ ] No overlapping touch targets
- [ ] Mobile-friendly spacing on small screens

## ✅ Responsive Design

### Zoom and Magnification
- [ ] Content is readable at 200% zoom
- [ ] No horizontal scrolling at 200% zoom
- [ ] Layout remains usable at 200% zoom
- [ ] Text reflows properly when zoomed

### Mobile Responsiveness
- [ ] All features work on mobile devices
- [ ] Touch targets are appropriately sized
- [ ] Navigation is accessible on mobile
- [ ] Modals work correctly on mobile

### Orientation
- [ ] Content works in portrait orientation
- [ ] Content works in landscape orientation
- [ ] No content is lost when rotating

## ✅ Additional Checks

### Language
- [ ] Page language is set (lang attribute)
- [ ] Language changes are marked
- [ ] Text direction is correct

### Timing
- [ ] No time limits on interactions
- [ ] Auto-dismiss notifications have sufficient time
- [ ] Users can extend time limits if needed

### Motion
- [ ] Respects prefers-reduced-motion
- [ ] Animations can be disabled
- [ ] No auto-playing animations

### Error Prevention
- [ ] Destructive actions require confirmation
- [ ] Form validation provides clear feedback
- [ ] Users can review before submitting

### Help and Documentation
- [ ] Keyboard shortcuts are documented
- [ ] Help is available when needed
- [ ] Error messages provide solutions

## Testing Tools

### Browser Extensions
- [ ] Test with axe DevTools
- [ ] Test with WAVE
- [ ] Test with Lighthouse

### Screen Readers
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (Mac/iOS)
- [ ] Test with TalkBack (Android)

### Keyboard Testing
- [ ] Test with keyboard only (no mouse)
- [ ] Test all interactive features
- [ ] Test all navigation paths

### Color Contrast Tools
- [ ] Check with WebAIM Contrast Checker
- [ ] Check with browser DevTools
- [ ] Check in high contrast mode

## Automated Testing

### Run Automated Tests
```bash
# Install dependencies
npm install --save-dev @axe-core/react pa11y

# Run accessibility tests
npm run test:a11y
```

### Continuous Integration
- [ ] Accessibility tests run on every commit
- [ ] Accessibility tests run on every PR
- [ ] Accessibility issues block deployment

## Manual Testing Schedule

### Daily
- [ ] Quick keyboard navigation check
- [ ] Visual focus indicator check

### Weekly
- [ ] Full keyboard navigation test
- [ ] Screen reader spot check
- [ ] Color contrast verification

### Monthly
- [ ] Complete accessibility audit
- [ ] Screen reader full test
- [ ] Mobile accessibility test

### Quarterly
- [ ] Third-party accessibility audit
- [ ] User testing with assistive technology users
- [ ] Compliance review

## Issue Tracking

### Priority Levels
- **Critical**: Blocks core functionality for users with disabilities
- **High**: Significantly impacts user experience
- **Medium**: Minor accessibility issue
- **Low**: Enhancement or nice-to-have

### Common Issues
- [ ] Missing alt text
- [ ] Insufficient color contrast
- [ ] Missing ARIA labels
- [ ] Keyboard trap
- [ ] Missing focus indicators
- [ ] Incorrect heading hierarchy
- [ ] Missing form labels
- [ ] Inaccessible modal

## Sign-off

### Tester Information
- **Name**: _______________
- **Date**: _______________
- **Browser**: _______________
- **Screen Reader**: _______________

### Results
- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] Medium/low issues documented
- [ ] Ready for production

### Notes
_Add any additional notes or observations here_

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
