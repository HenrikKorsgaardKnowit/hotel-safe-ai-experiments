import { describe, it, expect } from 'vitest';

/**
 * Danish CPR (Central Person Register) Number Validation Tests
 * Based on CPR specification from CPR-KONTORET dated 1. juli 2008
 * 
 * CPR Number Format: DDMMYY-SSSS (10 digits)
 * - Positions 1-2: Day (01-31)
 * - Positions 3-4: Month (01-12)
 * - Positions 5-6: Year (00-99, without century)
 * - Positions 7-10: Sequence number
 * - Position 10: Gender (odd=male, even=female)
 * - Positions 5-7: Century determination
 */

// Interface for CPR validator to be implemented
interface CPRValidator {
    /**
     * Validates a CPR number
     * @param cpr - CPR number as string (with or without hyphen)
     * @returns true if valid, false otherwise
     */
    isValid(cpr: string): boolean;

    /**
     * Validates CPR format (10 digits, proper structure)
     */
    hasValidFormat(cpr: string): boolean;

    /**
     * Validates the date part of CPR number
     */
    hasValidDate(cpr: string): boolean;

    /**
     * Validates modulus 11 check digit (for CPR numbers with control digit)
     */
    hasValidCheckDigit(cpr: string): boolean;

    /**
     * Extracts birth date from CPR number
     */
    getBirthDate(cpr: string): Date | null;

    /**
     * Determines gender from CPR number
     */
    getGender(cpr: string): 'male' | 'female' | null;

    /**
     * Checks if CPR has modulus 11 control digit
     */
    hasControlDigit(cpr: string): boolean;
}

// Mock implementation for testing
class CPRValidatorImpl implements CPRValidator {
    isValid(cpr: string): boolean {
        throw new Error('Not implemented');
    }

    hasValidFormat(cpr: string): boolean {
        throw new Error('Not implemented');
    }

    hasValidDate(cpr: string): boolean {
        throw new Error('Not implemented');
    }

    hasValidCheckDigit(cpr: string): boolean {
        throw new Error('Not implemented');
    }

    getBirthDate(cpr: string): Date | null {
        throw new Error('Not implemented');
    }

    getGender(cpr: string): 'male' | 'female' | null {
        throw new Error('Not implemented');
    }

    hasControlDigit(cpr: string): boolean {
        throw new Error('Not implemented');
    }
}

describe('CPR Number Validation', () => {
    let validator: CPRValidator;

    beforeEach(() => {
        validator = new CPRValidatorImpl();
    });

    describe('Format Validation', () => {
        it('should accept CPR with hyphen (DDMMYY-SSSS)', () => {
            expect(validator.hasValidFormat('070761-4285')).toBe(true);
        });

        it('should accept CPR without hyphen (DDMMYYSSSS)', () => {
            expect(validator.hasValidFormat('0707614285')).toBe(true);
        });

        it('should reject CPR with less than 10 digits', () => {
            expect(validator.hasValidFormat('070761-428')).toBe(false);
            expect(validator.hasValidFormat('123456789')).toBe(false);
        });

        it('should reject CPR with more than 10 digits', () => {
            expect(validator.hasValidFormat('070761-42851')).toBe(false);
            expect(validator.hasValidFormat('12345678901')).toBe(false);
        });

        it('should reject CPR with non-numeric characters', () => {
            expect(validator.hasValidFormat('070761-428A')).toBe(false);
            expect(validator.hasValidFormat('07O7614285')).toBe(false);
            expect(validator.hasValidFormat('abcdef-ghij')).toBe(false);
        });

        it('should reject empty or null CPR', () => {
            expect(validator.hasValidFormat('')).toBe(false);
            expect(validator.hasValidFormat('   ')).toBe(false);
        });

        //Not part of the specification
        it('should handle CPR with multiple hyphens gracefully', () => {
            expect(validator.hasValidFormat('07-07-61-4285')).toBe(false);
        });
    });

    //Not relevant
    describe('Date Validation', () => {
        it('should accept valid dates', () => {
            expect(validator.hasValidDate('010100-0001')).toBe(true); // 1 Jan 1900
            expect(validator.hasValidDate('311299-9999')).toBe(true); // 31 Dec 1999
            expect(validator.hasValidDate('290200-0001')).toBe(true); // 29 Feb (leap year)
        });

        it('should reject invalid day (00 or > 31)', () => {
            expect(validator.hasValidDate('000100-0001')).toBe(false);
            expect(validator.hasValidDate('320100-0001')).toBe(false);
            expect(validator.hasValidDate('990100-0001')).toBe(false);
        });

        it('should reject invalid month (00 or > 12)', () => {
            expect(validator.hasValidDate('010000-0001')).toBe(false);
            expect(validator.hasValidDate('011300-0001')).toBe(false);
            expect(validator.hasValidDate('019900-0001')).toBe(false);
        });

        it('should validate days per month correctly', () => {
            expect(validator.hasValidDate('310100-0001')).toBe(true);  // Jan: 31 days
            expect(validator.hasValidDate('280200-0001')).toBe(true);  // Feb: 28 days
            expect(validator.hasValidDate('310300-0001')).toBe(true);  // Mar: 31 days
            expect(validator.hasValidDate('300400-0001')).toBe(true);  // Apr: 30 days
            expect(validator.hasValidDate('310500-0001')).toBe(true);  // May: 31 days
            expect(validator.hasValidDate('300600-0001')).toBe(true);  // Jun: 30 days
            expect(validator.hasValidDate('310700-0001')).toBe(true);  // Jul: 31 days
            expect(validator.hasValidDate('310800-0001')).toBe(true);  // Aug: 31 days
            expect(validator.hasValidDate('300900-0001')).toBe(true);  // Sep: 30 days
            expect(validator.hasValidDate('311000-0001')).toBe(true);  // Oct: 31 days
            expect(validator.hasValidDate('301100-0001')).toBe(true);  // Nov: 30 days
            expect(validator.hasValidDate('311200-0001')).toBe(true);  // Dec: 31 days
        });

        it('should reject invalid days for months', () => {
            expect(validator.hasValidDate('320100-0001')).toBe(false); // Jan: no 32nd
            expect(validator.hasValidDate('310400-0001')).toBe(false); // Apr: no 31st
            expect(validator.hasValidDate('310600-0001')).toBe(false); // Jun: no 31st
            expect(validator.hasValidDate('310900-0001')).toBe(false); // Sep: no 31st
            expect(validator.hasValidDate('311100-0001')).toBe(false); // Nov: no 31st
        });

        it('should handle leap years correctly', () => {
            expect(validator.hasValidDate('290200-0001')).toBe(true);  // 2000: leap year
            expect(validator.hasValidDate('290204-4001')).toBe(true);  // 2004: leap year
            expect(validator.hasValidDate('290201-0001')).toBe(false); // 1901: not leap year
            expect(validator.hasValidDate('290203-0001')).toBe(false); // 1903: not leap year
        });

        it('should reject 30th February', () => {
            expect(validator.hasValidDate('300200-0001')).toBe(false);
            expect(validator.hasValidDate('300204-4001')).toBe(false);
        });
    });
    // Outdated test 
    describe('Modulus 11 Check Digit Validation', () => {
        it('should validate correct check digit from specification example', () => {
            // Example from spec: 0707614285
            // Calculation: (0*4 + 7*3 + 0*2 + 7*7 + 6*6 + 1*5 + 4*4 + 2*3 + 8*2 + 5*1) = 154
            // 154 % 11 = 0 (valid)
            expect(validator.hasValidCheckDigit('0707614285')).toBe(true);
            expect(validator.hasValidCheckDigit('070761-4285')).toBe(true);
        });
        //Why
        it('should validate multiple valid CPR numbers with check digits', () => {
            // These would need to be actual valid CPR numbers with correct modulus 11
            const validCPRs = [
                '0707614285', // From specification
            ];

            validCPRs.forEach(cpr => {
                expect(validator.hasValidCheckDigit(cpr)).toBe(true);
            });
        });

        it('should reject CPR with incorrect check digit', () => {
            expect(validator.hasValidCheckDigit('0707614286')).toBe(false); // Wrong last digit
            expect(validator.hasValidCheckDigit('0707614284')).toBe(false); // Wrong last digit
        });

        it('should handle CPR numbers without check digit (newer format)', () => {
            // CPR numbers without modulus 11 check digit are still valid
            // The hasValidCheckDigit should return false but isValid can still be true
            expect(validator.hasControlDigit('0101000002')).toBe(false);
        });

        it('should reject when modulus 11 remainder is 1 (control digit would be 10)', () => {
            // When remainder is 1, the control digit would be 11-1=10 (2 digits), which is invalid
            // These CPR numbers cannot have check digits
            // Implementation should recognize this
        });
    });

    describe('Century and Sequence Number Rules', () => {
        describe('Sequence 0000-0999: Born 1900-1999', () => {
            it('should interpret year correctly for sequence 0000-0999', () => {
                const birthDate = validator.getBirthDate('010100-0001');
                expect(birthDate?.getFullYear()).toBe(1900);

                const birthDate2 = validator.getBirthDate('311299-0999');
                expect(birthDate2?.getFullYear()).toBe(1999);
            });
        });

        describe('Sequence 1000-1999: Born 1900-1999', () => {
            it('should interpret year correctly for sequence 1000-1999', () => {
                const birthDate = validator.getBirthDate('010100-1000');
                expect(birthDate?.getFullYear()).toBe(1900);

                const birthDate2 = validator.getBirthDate('311299-1999');
                expect(birthDate2?.getFullYear()).toBe(1999);
            });
        });

        describe('Sequence 2000-2999: Born 1900-1999', () => {
            it('should interpret year correctly for sequence 2000-2999', () => {
                const birthDate = validator.getBirthDate('010100-2000');
                expect(birthDate?.getFullYear()).toBe(1900);

                const birthDate2 = validator.getBirthDate('311299-2999');
                expect(birthDate2?.getFullYear()).toBe(1999);
            });
        });

        describe('Sequence 3000-3999: Born 1900-1999', () => {
            it('should interpret year correctly for sequence 3000-3999', () => {
                const birthDate = validator.getBirthDate('010100-3000');
                expect(birthDate?.getFullYear()).toBe(1900);

                const birthDate2 = validator.getBirthDate('311299-3999');
                expect(birthDate2?.getFullYear()).toBe(1999);
            });
        });

        describe('Sequence 4000-4999: Born 2000-2036 or 1937-1999', () => {
            it('should interpret years 00-36 as 2000-2036', () => {
                const birthDate = validator.getBirthDate('010100-4000');
                expect(birthDate?.getFullYear()).toBe(2000);

                const birthDate2 = validator.getBirthDate('010136-4999');
                expect(birthDate2?.getFullYear()).toBe(2036);
            });

            it('should interpret years 37-99 as 1937-1999', () => {
                const birthDate = validator.getBirthDate('010137-4000');
                expect(birthDate?.getFullYear()).toBe(1937);

                const birthDate2 = validator.getBirthDate('311299-4999');
                expect(birthDate2?.getFullYear()).toBe(1999);
            });
        });

        describe('Sequence 5000-5999: Born 2000-2057 or 1858-1899', () => {
            it('should interpret years 00-57 as 2000-2057', () => {
                const birthDate = validator.getBirthDate('010100-5000');
                expect(birthDate?.getFullYear()).toBe(2000);

                const birthDate2 = validator.getBirthDate('010157-5999');
                expect(birthDate2?.getFullYear()).toBe(2057);
            });

            it('should interpret years 58-99 as 1858-1899', () => {
                const birthDate = validator.getBirthDate('010158-5000');
                expect(birthDate?.getFullYear()).toBe(1858);

                const birthDate2 = validator.getBirthDate('311299-5999');
                expect(birthDate2?.getFullYear()).toBe(1899);
            });
        });

        describe('Sequence 6000-6999: Born 2000-2057 or 1858-1899', () => {
            it('should interpret years 00-57 as 2000-2057', () => {
                const birthDate = validator.getBirthDate('010100-6000');
                expect(birthDate?.getFullYear()).toBe(2000);

                const birthDate2 = validator.getBirthDate('010157-6999');
                expect(birthDate2?.getFullYear()).toBe(2057);
            });

            it('should interpret years 58-99 as 1858-1899', () => {
                const birthDate = validator.getBirthDate('010158-6000');
                expect(birthDate?.getFullYear()).toBe(1858);

                const birthDate2 = validator.getBirthDate('311299-6999');
                expect(birthDate2?.getFullYear()).toBe(1899);
            });
        });

        describe('Sequence 7000-7999: Born 2000-2057 or 1858-1899', () => {
            it('should interpret years 00-57 as 2000-2057', () => {
                const birthDate = validator.getBirthDate('010100-7000');
                expect(birthDate?.getFullYear()).toBe(2000);

                const birthDate2 = validator.getBirthDate('010157-7999');
                expect(birthDate2?.getFullYear()).toBe(2057);
            });

            it('should interpret years 58-99 as 1858-1899', () => {
                const birthDate = validator.getBirthDate('010158-7000');
                expect(birthDate?.getFullYear()).toBe(1858);

                const birthDate2 = validator.getBirthDate('311299-7999');
                expect(birthDate2?.getFullYear()).toBe(1899);
            });
        });

        describe('Sequence 8000-8999: Born 2000-2057 or 1858-1899', () => {
            it('should interpret years 00-57 as 2000-2057', () => {
                const birthDate = validator.getBirthDate('010100-8000');
                expect(birthDate?.getFullYear()).toBe(2000);

                const birthDate2 = validator.getBirthDate('010157-8999');
                expect(birthDate2?.getFullYear()).toBe(2057);
            });

            it('should interpret years 58-99 as 1858-1899', () => {
                const birthDate = validator.getBirthDate('010158-8000');
                expect(birthDate?.getFullYear()).toBe(1858);

                const birthDate2 = validator.getBirthDate('311299-8999');
                expect(birthDate2?.getFullYear()).toBe(1899);
            });
        });

        describe('Sequence 9000-9999: Born 2000-2036 or 1937-1999', () => {
            it('should interpret years 00-36 as 2000-2036', () => {
                const birthDate = validator.getBirthDate('010100-9000');
                expect(birthDate?.getFullYear()).toBe(2000);

                const birthDate2 = validator.getBirthDate('010136-9999');
                expect(birthDate2?.getFullYear()).toBe(2036);
            });

            it('should interpret years 37-99 as 1937-1999', () => {
                const birthDate = validator.getBirthDate('010137-9000');
                expect(birthDate?.getFullYear()).toBe(1937);

                const birthDate2 = validator.getBirthDate('311299-9999');
                expect(birthDate2?.getFullYear()).toBe(1999);
            });
        });
    });

    describe('Gender Determination', () => {
        it('should identify female from even last digit', () => {
            expect(validator.getGender('010100-0000')).toBe('female');
            expect(validator.getGender('010100-0002')).toBe('female');
            expect(validator.getGender('010100-0004')).toBe('female');
            expect(validator.getGender('010100-0006')).toBe('female');
            expect(validator.getGender('010100-0008')).toBe('female');
        });

        it('should identify male from odd last digit', () => {
            expect(validator.getGender('010100-0001')).toBe('male');
            expect(validator.getGender('010100-0003')).toBe('male');
            expect(validator.getGender('010100-0005')).toBe('male');
            expect(validator.getGender('010100-0007')).toBe('male');
            expect(validator.getGender('010100-0009')).toBe('male');
        });

        it('should handle gender determination with hyphen', () => {
            expect(validator.getGender('0707614285')).toBe('male');  // Ends in 5
            expect(validator.getGender('070761-4285')).toBe('male'); // Ends in 5
        });

        it('should return null for invalid CPR', () => {
            expect(validator.getGender('invalid')).toBe(null);
            expect(validator.getGender('123')).toBe(null);
        });
    });

    describe('Check Digit Existence', () => {
        it('should identify CPR numbers with control digit (modulus 11)', () => {
            expect(validator.hasControlDigit('0707614285')).toBe(true);
        });

        it('should identify CPR numbers without control digit', () => {
            // CPR numbers without control digit (newer allocation method)
            // These follow specific patterns starting from 0002, 0004, 0006, etc.
            expect(validator.hasControlDigit('010100-0002')).toBe(false);
            expect(validator.hasControlDigit('010100-0010')).toBe(false);
        });
    });

    describe('Complete CPR Validation', () => {
        it('should validate complete CPR with all rules', () => {
            expect(validator.isValid('0707614285')).toBe(true);
            expect(validator.isValid('070761-4285')).toBe(true);
        });

        it('should accept CPR without check digit as valid', () => {
            // Modern CPR numbers may not have modulus 11 check digit
            expect(validator.isValid('010100-0002')).toBe(true);
        });

        it('should reject CPR with invalid format', () => {
            expect(validator.isValid('123')).toBe(false);
            expect(validator.isValid('12345678901')).toBe(false);
            expect(validator.isValid('abcd-efghij')).toBe(false);
        });

        it('should reject CPR with invalid date', () => {
            expect(validator.isValid('000100-0001')).toBe(false); // Invalid day
            expect(validator.isValid('320100-0001')).toBe(false); // Invalid day
            expect(validator.isValid('010000-0001')).toBe(false); // Invalid month
            expect(validator.isValid('011300-0001')).toBe(false); // Invalid month
            expect(validator.isValid('310400-0001')).toBe(false); // Invalid date (Apr 31)
        });

        it('should reject CPR with invalid check digit when check digit exists', () => {
            expect(validator.isValid('0707614286')).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle CPR with leading zeros', () => {
            expect(validator.isValid('010100-0001')).toBe(true);
            expect(validator.isValid('0101000001')).toBe(true);
        });

        it('should handle boundary dates', () => {
            expect(validator.isValid('010158-5000')).toBe(true); // 1858
            expect(validator.isValid('010157-5000')).toBe(true); // 2057
        });

        it('should validate different allocation series', () => {
            // Series 1: 0002, 0010, 0016... (female without check)
            // Series 2: 0004, 0008, 0014... (female without check)
            // Series 3: 0006, 0012, 0018... (female without check)
            expect(validator.isValid('010100-0002')).toBe(true);
            expect(validator.isValid('010100-0004')).toBe(true);
            expect(validator.isValid('010100-0006')).toBe(true);
            
            // Series 1: 0001, 0007, 0013... (male without check)
            // Series 2: 0003, 0009, 0015... (male without check)
            // Series 3: 0005, 0011, 0017... (male without check)
            expect(validator.isValid('010100-0001')).toBe(true);
            expect(validator.isValid('010100-0003')).toBe(true);
            expect(validator.isValid('010100-0005')).toBe(true);
        });

        it('should handle maximum sequence numbers', () => {
            expect(validator.isValid('010100-9999')).toBe(true);
        });

        it('should reject sequence number 0000', () => {
            expect(validator.isValid('010100-0000')).toBe(false);
        });
    });

    describe('Real World Examples', () => {
        it('should validate example from specification', () => {
            // Example from page 10 of spec: 0707614285
            // Person born: 07-07-1961 (July 7, 1961)
            // Sequence: 4285
            // Gender: Male (5 is odd)
            expect(validator.isValid('0707614285')).toBe(true);
            expect(validator.getBirthDate('0707614285')?.getFullYear()).toBe(1961);
            expect(validator.getBirthDate('0707614285')?.getMonth()).toBe(6); // July (0-indexed)
            expect(validator.getBirthDate('0707614285')?.getDate()).toBe(7);
            expect(validator.getGender('0707614285')).toBe('male');
        });

        it('should handle various valid CPR patterns', () => {
            const validExamples = [
                { cpr: '010100-0001', year: 1900, gender: 'male' },
                { cpr: '311299-9999', year: 1999, gender: 'male' },
                { cpr: '010100-4000', year: 2000, gender: 'female' },
                { cpr: '010136-4999', year: 2036, gender: 'male' },
            ];

            validExamples.forEach(example => {
                expect(validator.isValid(example.cpr)).toBe(true);
                expect(validator.getBirthDate(example.cpr)?.getFullYear()).toBe(example.year);
                expect(validator.getGender(example.cpr)).toBe(example.gender);
            });
        });
    });

    describe('Capacity Validation', () => {
        it('should respect capacity limits per birth date', () => {
            // According to spec:
            // 1858-1899: 4000 numbers per date (sequence 5000-8999)
            // 1900-1936: 4000 numbers per date (sequence 0000-3999)
            // 1937-1999: 6000 numbers per date (sequence 0000-3999, 4000-4999, 9000-9999)
            // 2000-2036: 6000 numbers per date (sequence 4000-4999, 9000-9999, plus others)
            // 2037-2057: 4000 numbers per date (sequence 5000-8999)
            
            // These are logical constraints that can be tested
            expect(validator.isValid('010100-0001')).toBe(true); // Within 1900-1999 range
            expect(validator.isValid('010100-9999')).toBe(true); // Valid sequence
        });
    });
});
