// REFACTORING SUGGESTIONS:
// See end of file for detailed review comments

export enum Button {
    D0, D1, D2, D3, D4, D5, D6, D7, D8, D9, LOCK, KEY, PIN
}

export interface Safe {
    // Enter a button press on the safe
    enter(button: Button): void;
    
    /** Read the output of the display on the safe.
     * POSTCONDITION: It is always a non-null string of
     * exactly 6 characters that can be printed on
     * a 7-segment display.
     * @return the output on the display 
     */
    readDisplay(): string;
    
    /** Get the state of the safe: is it locked or not.
     * @return true if the safe is locked    
     */
    isLocked(): boolean;
}

/**
 * States the safe can be in
 * 
 * REVIEW NOTE 8: SafeState enum is private to module
 * Consider: export enum SafeState for better testing
 * Or add getState() method for debugging/testing
 * 
 * REVIEW NOTE 12: State Transition Diagram:
 * State Transitions:
 * LOCKED_IDLE -> ENTERING_PIN (on KEY)
 * LOCKED_IDLE -> LOCKED_ERROR (on digit)
 * LOCKED_ERROR -> ENTERING_PIN (on KEY)
 * ENTERING_PIN -> UNLOCKED (correct PIN)
 * ENTERING_PIN -> LOCKED_IDLE (wrong PIN)
 * UNLOCKED -> LOCKED_IDLE (on LOCK)
 * UNLOCKED -> SETTING_NEW_PIN (on PIN)
 * SETTING_NEW_PIN -> UNLOCKED (on PIN with 6 digits)
 */
enum SafeState {
    LOCKED_IDLE,        // Locked, awaiting KEY press
    LOCKED_ERROR,       // Error state (digit pressed without KEY)
    ENTERING_PIN,       // Entering PIN to unlock
    UNLOCKED,           // Unlocked state
    SETTING_NEW_PIN     // Setting new PIN code
}

/**
 * Implementation of the hotel safe
 * 
 * REVIEW NOTE 2: CODE SMELL - Dual responsibility
 * The 'locked' boolean is redundant - it can be derived from state:
 * isLocked(): boolean { return this.state !== SafeState.UNLOCKED; }
 * This eliminates potential inconsistency bugs where locked and state disagree.
 * 
 * REVIEW NOTE 6: MAGIC NUMBER - '6' appears multiple times
 * RECOMMENDATION: const PIN_LENGTH = 6; at class level
 * 
 * REVIEW NOTE 10: DISPLAY INCONSISTENCY
 * Why "CLOSED" (6 chars) but "ERROR " (6 chars with space)?
 * Consider: const DISPLAY_CLOSED = 'CLOSED'; const DISPLAY_ERROR = 'ERROR ';
 * 
 * REVIEW NOTE 13: POTENTIAL SECURITY ISSUE
 * PIN stored in plain text. In real systems:
 * - Store hash of PIN, not PIN itself
 * - Consider timing attack resistance (constant-time comparison)
 */
export class SafeImpl implements Safe {
    private locked: boolean = true; // REVIEW: Redundant - can derive from state
    private display: string = '      '; // 6 spaces - blank display
    private currentPin: string = '123456'; // Factory default PIN - REVIEW: Should be hashed
    private state: SafeState = SafeState.LOCKED_IDLE;
    private enteredDigits: string = '';
    private newPinBuffer: string = '';

    enter(button: Button): void {
        // Handle button press based on current state
        switch (this.state) {
            case SafeState.LOCKED_IDLE:
                this.handleLockedIdle(button);
                break;
            case SafeState.LOCKED_ERROR:
                this.handleLockedError(button);
                break;
            case SafeState.ENTERING_PIN:
                this.handleEnteringPin(button);
                break;
            case SafeState.UNLOCKED:
                this.handleUnlocked(button);
                break;
            case SafeState.SETTING_NEW_PIN:
                this.handleSettingNewPin(button);
                break;
        }
    }

    readDisplay(): string {
        // REVIEW NOTE 11: MISSING VALIDATION
        // No validation that display is always 6 chars
        // Could add assertion/invariant check:
        // if (this.display.length !== 6) {
        //     throw new Error(`Display invariant violation: ${this.display.length} chars`);
        // }
        return this.display;
    }

    isLocked(): boolean {
        return this.locked;
    }

    /**
     * Handle button presses when safe is locked and idle
     */
    private handleLockedIdle(button: Button): void {
        if (button === Button.KEY) {
            // Start PIN entry sequence
            this.state = SafeState.ENTERING_PIN;
            this.enteredDigits = '';
            this.display = '      '; // Clear display
        } else if (button === Button.LOCK) {
            // Already locked, no change
            // Display remains as is
        } else if (this.isDigitButton(button)) {
            // Forgot to press KEY first - ERROR
            this.state = SafeState.LOCKED_ERROR;
            this.display = 'ERROR ';
        }
        // Other buttons (PIN) are ignored when locked
    }

    /**
     * Handle button presses when in error state
     */
    private handleLockedError(button: Button): void {
        if (button === Button.KEY) {
            // Clear error and start PIN entry
            this.state = SafeState.ENTERING_PIN;
            this.enteredDigits = '';
            this.display = '      ';
        } else {
            // All other buttons keep showing ERROR
            this.display = 'ERROR ';
        }
    }

    /**
     * Handle button presses when entering PIN to unlock
     * 
     * REVIEW NOTE 5: CODE DUPLICATION
     * PIN entry logic repeated in handleEnteringPin() and handleSettingNewPin()
     * Could extract common behavior
     * 
     * REVIEW NOTE 7: UNCLEAR BEHAVIOR
     * What if KEY pressed mid-entry? Current: Resets to empty display but stays in ENTERING_PIN
     * Should it return to LOCKED_IDLE? User story doesn't specify.
     */
    private handleEnteringPin(button: Button): void {
        if (this.isDigitButton(button)) {
            const digit = this.buttonToDigit(button);
            this.enteredDigits += digit; // REVIEW NOTE 9: String concatenation
            
            // Update display to show entered digits
            this.display = this.enteredDigits.padEnd(6, ' ');
            
            // Check if we have 6 digits
            if (this.enteredDigits.length === 6) {
                if (this.enteredDigits === this.currentPin) {
                    // Correct PIN - unlock
                    this.locked = false;
                    this.display = 'OPEN  ';
                    this.state = SafeState.UNLOCKED;
                } else {
                    // Wrong PIN - clear display and stay locked
                    this.display = '      ';
                    this.state = SafeState.LOCKED_IDLE;
                }
                this.enteredDigits = '';
            }
        } else if (button === Button.KEY) {
            // Reset PIN entry
            this.enteredDigits = '';
            this.display = '      ';
        }
        // Other buttons are ignored during PIN entry
    }

    /**
     * Handle button presses when safe is unlocked
     */
    private handleUnlocked(button: Button): void {
        if (button === Button.LOCK) {
            // Lock the safe
            this.locked = true;
            this.display = 'CLOSED';
            this.state = SafeState.LOCKED_IDLE;
        } else if (button === Button.PIN) {
            // Start setting new PIN
            this.state = SafeState.SETTING_NEW_PIN;
            this.newPinBuffer = '';
            this.display = '      ';
        }
        // Other buttons are ignored when unlocked
    }

    /**
     * Handle button presses when setting new PIN
     * 
     * REVIEW NOTE 3: MISSING EDGE CASE
     * What if PIN button pressed twice quickly without 6 digits?
     * Current: Ignored (no action). Consider clearing buffer or showing error.
     * 
     * REVIEW NOTE 4: MISSING EDGE CASE
     * What happens if KEY pressed during PIN setting?
     * Should KEY cancel PIN setting and return to unlocked state?
     * 
     * REVIEW NOTE 14: MISSING FEATURE
     * No way to cancel PIN setting. If user enters wrong digit, must complete all 6.
     * Real safe might allow LOCK or KEY to cancel.
     */
    private handleSettingNewPin(button: Button): void {
        if (this.isDigitButton(button)) {
            const digit = this.buttonToDigit(button);
            this.newPinBuffer += digit;
            
            // Update display to show entered digits
            this.display = this.newPinBuffer.padEnd(6, ' ');
            
            // Keep accepting digits until we have 6
            if (this.newPinBuffer.length > 6) {
                // Truncate if somehow more than 6
                this.newPinBuffer = this.newPinBuffer.substring(0, 6);
            }
        } else if (button === Button.PIN && this.newPinBuffer.length === 6) {
            // Confirm new PIN (only if we have exactly 6 digits)
            this.currentPin = this.newPinBuffer;
            this.display = 'CODE  ';
            this.state = SafeState.UNLOCKED;
            this.newPinBuffer = '';
        }
        // Other buttons or PIN without 6 digits are ignored
    }

    /**
     * Check if button is a digit button (D0-D9)
     */
    private isDigitButton(button: Button): boolean {
        return button >= Button.D0 && button <= Button.D9;
    }

    /**
     * Convert button to digit string
     * 
     * REVIEW NOTE 1: CRITICAL BUG - buttonToDigit() returns enum index, not the actual digit
     * Current implementation: Button.D0=0, Button.D1=1, etc.
     * button.toString() returns "0", "1", etc. - which are the enum VALUES, not names
     * This accidentally works but is fragile. If enum order changes, this breaks.
     * 
     * RECOMMENDATION: Use explicit mapping:
     * private buttonToDigit(button: Button): string {
     *     const digitMap: Record<number, string> = {
     *         [Button.D0]: '0', [Button.D1]: '1', [Button.D2]: '2',
     *         [Button.D3]: '3', [Button.D4]: '4', [Button.D5]: '5',
     *         [Button.D6]: '6', [Button.D7]: '7', [Button.D8]: '8', [Button.D9]: '9'
     *     };
     *     return digitMap[button] ?? '';
     * }
     */
    private buttonToDigit(button: Button): string {
        if (button >= Button.D0 && button <= Button.D9) {
            return button.toString(); // REVIEW: Fragile - depends on enum order
        }
        return '';
    }
}

/* ================================================================================
 * COMPREHENSIVE CODE REVIEW SUMMARY
 * ================================================================================
 * 
 * CRITICAL ISSUES (Fix Immediately):
 * ----------------------------------
 * 1. buttonToDigit() implementation is fragile - works by accident
 *    Priority: HIGH - Could break if enum definition changes
 * 
 * DESIGN IMPROVEMENTS (Refactor):
 * -------------------------------
 * 2. Remove 'locked' field redundancy - derive from state
 *    Priority: MEDIUM - Reduces bug surface area
 * 
 * 3-4. Missing edge case handling:
 *    - PIN button without 6 digits during setting
 *    - KEY button during PIN setting
 *    Priority: MEDIUM - Improves robustness
 * 
 * 5. Extract duplicated PIN entry logic
 *    Priority: LOW - Reduces code duplication
 * 
 * CODE QUALITY (Nice to Have):
 * ---------------------------
 * 6. Extract magic number 6 to constant PIN_LENGTH
 * 7. Clarify KEY behavior during PIN entry
 * 8. Export SafeState for testing
 * 9. Consider string building optimization
 * 10. Standardize display message formatting
 * 11. Add display length validation
 * 12. Document state transitions (DONE above)
 * 13. Security note about plain text PIN storage
 * 14. Add PIN setting cancellation feature
 * 15. Consider method grouping/organization
 * 
 * OVERALL ASSESSMENT:
 * ------------------
 * ✅ Clean state machine design
 * ✅ Handles all user stories correctly
 * ✅ Good separation of concerns
 * ⚠️  One critical fragility in buttonToDigit()
 * ⚠️  Some edge cases not handled
 * ⚠️  Minor redundancy in state tracking
 * 
 * REFACTORING PRIORITY:
 * 1. HIGH: Fix buttonToDigit() with explicit mapping
 * 2. MEDIUM: Remove 'locked' field redundancy
 * 3. MEDIUM: Add missing edge case handling
 * 4. LOW: Extract constants and reduce duplication
 */
