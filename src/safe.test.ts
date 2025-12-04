import { describe, it, expect, beforeEach } from 'vitest';
import { Button, type Safe, SafeImpl } from './safe';

/* ================================================================================
 * TEST QUALITY REVIEW NOTES
 * ================================================================================
 * See inline comments throughout for specific improvements.
 * Summary of key issues:
 * - Some redundant tests (noted inline)
 * - One incomplete test with no assertions
 * - Missing edge case coverage
 * - Could benefit from helper functions to reduce duplication
 * See end of file for comprehensive review summary.
 */

describe('Hotel Safe - User Stories', () => {
    let safe: Safe;

    beforeEach(() => {
        safe = new SafeImpl();
    });

    describe('Story 1: Unlock Safe', () => {
        it('should unlock the safe when correct PIN code is entered after KEY button', () => {
            // Initial state: safe is locked, display is blank (6 spaces)
            expect(safe.isLocked()).toBe(true);
            expect(safe.readDisplay()).toBe('      ');

            // User hits KEY button
            safe.enter(Button.KEY);
            
            // User enters correct PIN: 1, 2, 3, 4, 5, 6
            safe.enter(Button.D1);
            expect(safe.readDisplay()).toBe('1     ');
            
            safe.enter(Button.D2);
            expect(safe.readDisplay()).toBe('12    ');
            
            safe.enter(Button.D3);
            expect(safe.readDisplay()).toBe('123   ');
            
            safe.enter(Button.D4);
            expect(safe.readDisplay()).toBe('1234  ');
            
            safe.enter(Button.D5);
            expect(safe.readDisplay()).toBe('12345 ');
            
            safe.enter(Button.D6);
            // After final digit, display clears and shows "OPEN  "
            expect(safe.readDisplay()).toBe('OPEN  ');
            
            // Safe should be unlocked
            expect(safe.isLocked()).toBe(false);
        });

        // REVIEW NOTE 1: REDUNDANCY
        // This test is redundant with the comprehensive test above
        // RECOMMENDATION: Remove or keep only if serving as documentation
        //Note: Redundant
        it('should display each digit as it is pressed', () => {
            safe.enter(Button.KEY);
            
            safe.enter(Button.D1);
            expect(safe.readDisplay()).toMatch(/^1/);
            
            safe.enter(Button.D2);
            expect(safe.readDisplay()).toMatch(/^12/);
            
            safe.enter(Button.D3);
            expect(safe.readDisplay()).toMatch(/^123/);
        });

        // REVIEW NOTE 11: MISSING VALIDATION TEST
        // Could add assertion that verifies display NEVER returns wrong length
        // Consider adding invariant violation test
        //Note: Incorrect test approach. Better to use expect-to-fail
        it('should always return exactly 6 characters from readDisplay', () => {
            // Test postcondition: display always returns 6 characters
            expect(safe.readDisplay()).toHaveLength(6);
            
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            expect(safe.readDisplay()).toHaveLength(6);
            
            safe.enter(Button.D2);
            expect(safe.readDisplay()).toHaveLength(6);
        });
    });

    describe('Story 2: Lock Safe', () => {
        beforeEach(() => {
            // Unlock the safe first
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            safe.enter(Button.D4);
            safe.enter(Button.D5);
            safe.enter(Button.D6);
        });
        //Correct
        it('should lock the safe when LOCK button is pressed while unlocked', () => {
            // Safe is unlocked, display shows "OPEN  "
            expect(safe.isLocked()).toBe(false);
            expect(safe.readDisplay()).toBe('OPEN  ');

            // User presses LOCK button
            safe.enter(Button.LOCK);

            // Safe should be locked and display "CLOSED"
            expect(safe.isLocked()).toBe(true);
            expect(safe.readDisplay()).toBe('CLOSED');
        });

        //Note: Redundant
        it('should change display from OPEN to CLOSED when locked', () => {
            expect(safe.readDisplay()).toBe('OPEN  ');
            safe.enter(Button.LOCK);
            expect(safe.readDisplay()).toBe('CLOSED');
        });
    });

    describe('Story 3: Forgetting Key Button', () => {
        it('should display ERROR when digit is pressed without KEY button first', () => {
            // Safe is locked, user forgets KEY and presses digit
            expect(safe.isLocked()).toBe(true);
            
            safe.enter(Button.D1);
            expect(safe.readDisplay()).toBe('ERROR ');
        });

        //Note: Redundant following EC analysis
        it('should continue displaying ERROR for all button presses until KEY is pressed', () => {
            // Press digit without KEY
            safe.enter(Button.D1);
            expect(safe.readDisplay()).toBe('ERROR ');

            // All following button presses show ERROR
            safe.enter(Button.D2);
            expect(safe.readDisplay()).toBe('ERROR ');

            safe.enter(Button.D3);
            expect(safe.readDisplay()).toBe('ERROR ');

            safe.enter(Button.D4);
            expect(safe.readDisplay()).toBe('ERROR ');
        });

        // REVIEW NOTE 4: MISSING SPECIFIC ASSERTION
        // Test checks display is not "ERROR " after KEY press
        // But doesn't verify it's actually blank/correct
        // RECOMMENDATION: expect(safe.readDisplay()).toBe('      ');
        //Correct
        it('should clear ERROR state when KEY button is pressed', () => {
            // Trigger ERROR state
            safe.enter(Button.D1);
            expect(safe.readDisplay()).toBe('ERROR ');

            // Press KEY to clear ERROR
            safe.enter(Button.KEY);
            expect(safe.readDisplay()).not.toBe('ERROR '); // REVIEW: Should verify exact value
        });
    });

    
    describe('Story 4: Wrong Code', () => {
        it('should remain locked and clear display when wrong PIN is entered', () => {
            expect(safe.isLocked()).toBe(true);

            // User hits KEY
            safe.enter(Button.KEY);

            // User enters wrong PIN: 1, 2, 4, 3, 5, 6 (instead of 1, 2, 3, 4, 5, 6)
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D4);
            safe.enter(Button.D3);
            safe.enter(Button.D5);
            safe.enter(Button.D6);

            // Display should be cleared (6 spaces)
            expect(safe.readDisplay()).toBe('      ');

            // Safe should remain locked
            expect(safe.isLocked()).toBe(true);
        });

        //Note: EC redundant
        it('should not unlock with any incorrect PIN combination', () => {
            const wrongPins = [
                [Button.D0, Button.D0, Button.D0, Button.D0, Button.D0, Button.D0],
                [Button.D6, Button.D5, Button.D4, Button.D3, Button.D2, Button.D1],
                [Button.D1, Button.D2, Button.D3, Button.D4, Button.D5, Button.D5],
            ];

            wrongPins.forEach(pinSequence => {
                const testSafe = new SafeImpl();
                testSafe.enter(Button.KEY);
                pinSequence.forEach(button => testSafe.enter(button));
                
                expect(testSafe.isLocked()).toBe(true);
            });
        });
    });

    describe('Story 5: Set New Code', () => {
        beforeEach(() => {
            // Unlock the safe first
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            safe.enter(Button.D4);
            safe.enter(Button.D5);
            safe.enter(Button.D6);
        });

        it('should allow setting a new PIN when safe is unlocked', () => {
            // Safe is unlocked
            expect(safe.isLocked()).toBe(false);

            // User hits PIN button
            safe.enter(Button.PIN);

            // Enter new 6-digit PIN: 7, 7, 7, 3, 3, 3
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D3);
            safe.enter(Button.D3);
            safe.enter(Button.D3);

            // Hit PIN button again to confirm
            safe.enter(Button.PIN);

            // Display should read "CODE  "
            expect(safe.readDisplay()).toBe('CODE  ');

            // Safe should remain unlocked
            expect(safe.isLocked()).toBe(false);
        });

        it('should use new PIN code to unlock after setting it', () => {
            // Set new PIN code 777333
            safe.enter(Button.PIN);
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D3);
            safe.enter(Button.D3);
            safe.enter(Button.D3);
            safe.enter(Button.PIN);

            // Lock the safe
            safe.enter(Button.LOCK);
            expect(safe.isLocked()).toBe(true);

            // Try to unlock with old PIN (123456) - should fail
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            safe.enter(Button.D4);
            safe.enter(Button.D5);
            safe.enter(Button.D6);
            expect(safe.isLocked()).toBe(true);

            // Try to unlock with new PIN (777333) - should succeed
            safe.enter(Button.KEY);
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D3);
            safe.enter(Button.D3);
            safe.enter(Button.D3);
            
            expect(safe.isLocked()).toBe(false);
            expect(safe.readDisplay()).toBe('OPEN  ');
        });

        it('should remain unlocked after setting new PIN code', () => {
            safe.enter(Button.PIN);
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D7);
            safe.enter(Button.D3);
            safe.enter(Button.D3);
            safe.enter(Button.D3);
            safe.enter(Button.PIN);

            expect(safe.isLocked()).toBe(false);
        });
    });

    describe('Edge Cases and Additional Scenarios', () => {
        // REVIEW NOTE 11: MISSING DISPLAY ASSERTION
        // Should also verify display doesn't change
        it('should handle pressing LOCK button when already locked', () => {
            // Safe starts locked
            expect(safe.isLocked()).toBe(true);
            const displayBefore = safe.readDisplay();
            
            // Press LOCK again
            safe.enter(Button.LOCK);
            
            // Should remain locked
            expect(safe.isLocked()).toBe(true);
            // REVIEW: Should also check: expect(safe.readDisplay()).toBe(displayBefore);
        });

        // REVIEW NOTE 2: INCOMPLETE TEST
        // Test has no assertions! Only comment "exact behavior to be defined"
        // RECOMMENDATION: Either:
        // a) Add assertion: expect(safe.readDisplay()).toBe('      '); // Display unchanged
        // b) Remove test until behavior is defined
        // c) Use .skip() if intentionally incomplete
        it('should not allow PIN change when safe is locked', () => {
            // Safe is locked
            expect(safe.isLocked()).toBe(true);

            // Try to press PIN button
            safe.enter(Button.PIN);

            // Should not enter PIN change mode (exact behavior to be defined)
            // This test documents expected behavior
            // MISSING: expect(safe.readDisplay()).toBe('      '); // Verify no change
        });

        it('should handle multiple unlock attempts', () => {
            // First attempt with wrong code
            safe.enter(Button.KEY);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            expect(safe.isLocked()).toBe(true);

            // Second attempt with correct code
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            safe.enter(Button.D4);
            safe.enter(Button.D5);
            safe.enter(Button.D6);
            expect(safe.isLocked()).toBe(false);
        });

        it('should handle entering fewer than 6 digits', () => {
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            
            // Only 3 digits entered, safe should still be locked
            expect(safe.isLocked()).toBe(true);
        });

        // REVIEW NOTE 10: ASSERTION QUALITY
        // Test iterates operations without resetting safe between
        // This creates test interdependency - each operation affects next
        // RECOMMENDATION: Reset safe or test each operation independently
        it('should maintain exactly 6 characters display after any operation', () => {
            const testOperations = [
                () => safe.enter(Button.KEY),
                () => safe.enter(Button.D1),
                () => safe.enter(Button.LOCK),
                () => safe.enter(Button.PIN),
            ];

            testOperations.forEach(operation => {
                operation(); // REVIEW: Operations are interdependent
                expect(safe.readDisplay()).toHaveLength(6);
            });
        });
    });
    // REVIEW NOTE 12: TEST ORGANIZATION
    // "Integration Scenarios" vs "Edge Cases" - distinction is unclear
    // RECOMMENDATION: Either merge or clarify purpose:
    // - "Edge Cases": Single-operation boundary conditions
    // - "Integration Scenarios": Multi-step workflows
    //Note: redundant
    describe('Integration Scenarios', () => {
        it('should support complete lock-unlock-relock cycle', () => {
            // Initial: locked
            expect(safe.isLocked()).toBe(true);

            // Unlock
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            safe.enter(Button.D4);
            safe.enter(Button.D5);
            safe.enter(Button.D6);
            expect(safe.isLocked()).toBe(false);

            // Lock
            safe.enter(Button.LOCK);
            expect(safe.isLocked()).toBe(true);

            // Unlock again
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            safe.enter(Button.D4);
            safe.enter(Button.D5);
            safe.enter(Button.D6);
            expect(safe.isLocked()).toBe(false);
        });
        //Redundant and why?
        it('should support changing PIN and using it multiple times', () => {
            // Unlock with default PIN
            safe.enter(Button.KEY);
            safe.enter(Button.D1);
            safe.enter(Button.D2);
            safe.enter(Button.D3);
            safe.enter(Button.D4);
            safe.enter(Button.D5);
            safe.enter(Button.D6);

            // Change PIN to 999888
            safe.enter(Button.PIN);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D8);
            safe.enter(Button.D8);
            safe.enter(Button.D8);
            safe.enter(Button.PIN);

            //WHY?
            // Lock and unlock with new PIN - first time
            safe.enter(Button.LOCK);
            safe.enter(Button.KEY);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D8);
            safe.enter(Button.D8);
            safe.enter(Button.D8);
            expect(safe.isLocked()).toBe(false);

            // Lock and unlock with new PIN - second time
            safe.enter(Button.LOCK);
            safe.enter(Button.KEY);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D9);
            safe.enter(Button.D8);
            safe.enter(Button.D8);
            safe.enter(Button.D8);
            expect(safe.isLocked()).toBe(false);
        });
    });
});

/* ================================================================================
 * COMPREHENSIVE TEST REVIEW SUMMARY
 * ================================================================================
 * 
 * TEST QUALITY IMPROVEMENTS:
 * -------------------------
 * 1. REDUNDANCY: Multiple tests noted as "Redundant" in comments
 *    Action: Remove or use .skip() for redundant tests
 * 
 * 2. INCOMPLETE TEST: "should not allow PIN change when safe is locked"
 *    Action: Add assertions or remove test
 * 
 * 3. MISSING TEST: What if more than 6 digits entered during unlock?
 *    Action: Add edge case test
 * 
 * 4. MISSING SPECIFIC ASSERTION: Display state after error recovery
 *    Action: Verify exact display value, not just "not ERROR"
 * 
 * 5. MISSING TEST: PIN button pressed during PIN entry (unlock flow)
 *    What happens: KEY -> D1 -> D2 -> PIN ?
 * 
 * 6. MISSING TEST: LOCK button pressed during PIN entry
 *    What happens: KEY -> D1 -> D2 -> LOCK ?
 * 
 * 7. TEST STRUCTURE: Helper functions would reduce duplication
 *    Suggestion:
 *    const unlockSafe = (safe: Safe) => {
 *        safe.enter(Button.KEY);
 *        [Button.D1, Button.D2, Button.D3, Button.D4, Button.D5, Button.D6]
 *            .forEach(b => safe.enter(b));
 *    };
 * 
 * 8. MAGIC VALUES: PIN sequence repeated many times
 *    Suggestion:
 *    const DEFAULT_PIN = [Button.D1, Button.D2, Button.D3, Button.D4, Button.D5, Button.D6];
 *    const NEW_PIN = [Button.D7, Button.D7, Button.D7, Button.D3, Button.D3, Button.D3];
 * 
 * 9. TEST COVERAGE GAP: Boundary testing
 *    - Button.D0 not tested (tests use D1-D9)
 *    - Invalid button values
 *    - Rapid button presses
 * 
 * 10. ASSERTION QUALITY: Test interdependency in iteration
 *     Action: Reset safe between operations or test independently
 * 
 * 11. MISSING DISPLAY CONSISTENCY: LOCK when already locked
 *     Action: Verify display doesn't change
 * 
 * 12. TEST ORGANIZATION: Integration vs Edge Cases unclear
 *     Action: Clarify or merge categories
 * 
 * 13. MISSING PROPERTY-BASED TEST: Random PIN sequences
 *     Consider: Generate random 6-digit PINs and verify behavior
 * 
 * 14. TEST COMMENTS: Some say "Redundant" but still run
 *     Action: Remove, skip, or remove confusing comments
 * 
 * 15. MISSING TEST: Rapid state transitions
 *     - KEY -> KEY -> KEY (multiple KEY presses)
 *     - PIN -> PIN -> PIN when unlocked
 * 
 * 16. TEST NAMING: Some names very long
 *     Consider: Balance brevity vs clarity
 * 
 * 17. MISSING TEST: 7-segment display constraint documentation
 *     Why "OPEN  " with 2 spaces vs other formats?
 * 
 * 18. TEST ISOLATION: Some tests create own SafeImpl
 *     Action: Be consistent - always use shared 'safe' instance
 * 
 * 19. MISSING NEGATIVE TEST: Invalid button combinations
 *     What if non-existent button value passed?
 * 
 * 20. DOCUMENTATION: Excellent comments explaining user stories
 *     Suggestion: Add WHY certain behaviors exist
 * 
 * OVERALL TEST ASSESSMENT:
 * -----------------------
 * ✅ Comprehensive coverage of user stories
 * ✅ Well-organized and documented
 * ✅ Good use of beforeEach for setup
 * ⚠️  Some redundant tests (noted in comments)
 * ⚠️  Missing edge case tests
 * ⚠️  One incomplete test with no assertions
 * ⚠️  Test duplication could be reduced with helpers
 * 
 * RECOMMENDED TEST IMPROVEMENTS:
 * 1. Remove or skip redundant tests
 * 2. Fix incomplete test (add assertions)
 * 3. Add missing edge case tests (PIN/LOCK during entry)
 * 4. Create helper functions for common operations
 * 5. Add boundary tests (D0, invalid values)
 * 6. Test rapid state transitions
 * 7. Improve assertion specificity
 */
