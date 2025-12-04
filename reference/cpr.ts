import { describe, expect, test } from 'vitest'
import { validateIsOver18 } from './cpr'

/*

 We get the information about the CPR construct here: https://www.cpr.dk/media/12066/personnummeret-i-cpr.pdf 

 From the table on page 5ff, we can make an Equivalence Class analysis from the specification:

 Case 1: if the 7th digit is 0, 1, 2, 3, then the person is born in 19xx
 Case 2: if the 7th digit is (4 OR 9) AND the birthyear is 00 to 36 (<=36), then the person is born in the 19xx
 Case 3: if the 7th digit is (4 OR 9) AND the birthyear is larger than 36 (>36), then the person is born in the 20xx
 Case 4: if the 7th digit is (5, 6, 7 OR 8) AND the birthyear is between 00 to 57 (<=57), then the person is born in the 20xx
 Case 5: if the 7th digit is (5, 6, 7 OR 8) AND the birthyear is larger than 57 (>57), then the person is born in the 18xx

 The following make the same analysis with a bit of variation. Do we trust that?: https://kronsell.net/cpralder.htm

 We need to test all cases

 Important: Testing the edges around the current date will make the test cases fail at some point. 

 We tackle case 1, 2 and 5 first. Because if a person is not born in 20xx, then they are above 18.

 We can ignore case 3 for another 11 years!

 We need to focus on case 4 as this contains date sensitive examples
 */

// Note: the age (digit 5 and 6) does not matter because anyone born in 19xx is above 18. We only need to check the 7th digit
describe('Test CPR age validation returns true for case 1: 2025 minus 1999 > 18', () => {

  test('Case 1 with 7th digit as 0 returns true', () => {
    expect(validateIsOver18('100499-0729')).toBe(true)
  })

  test('Case 1 with 7th digit as 1 returns true', () => {
    expect(validateIsOver18('100499-1729')).toBe(true)
  })

  test('Case 1 with 7th digit as 2 returns true', () => {
    expect(validateIsOver18('100499-2729')).toBe(true)
  })

  test('Case 1 with 7th digit as 3 returns true', () => {
    expect(validateIsOver18('100499-3729')).toBe(true)
  })
})

// Note: we do not have to do any date validation here either. We only care about the 7th digit and the age <=36, because anyone born in 19xx is above 18
describe('Test CPR age validation returns true for case 2: Age <=36 AND > current year - 18', () => {

  //Note: we need to deal with this test in the furture. Lets make the date dynamic
  const d = new Date()
  // Today minus 18 years
  d.setFullYear(d.getFullYear() - 18)
  const year = d.getFullYear().toString().slice(-2)

  test('Case 2 with 7th digit as 4 and birthyear 20 returns true', () => {
    expect(validateIsOver18(`1004${ year }-4729`)).toBe(true)
  })

  test('Case 2 with 7th digit as 9 and birthyear 20 returns true', () => {
    expect(validateIsOver18(`1004${ year }-9729`)).toBe(true)
  })
})


// Note: we do not have to do any date validation here either. We only care about the 7th digit and the age <=36, because anyone born in 19xx is above 18
describe('Test CPR age validation returns false for case 2: Age <=36 AND currentyear - 1 ', () => {

  //Note: we need to deal with this test in the furture. Lets make the date dynamic
  const d = new Date()
  // Today minus 1
  d.setFullYear(d.getFullYear() - 1)
  const year = d.getFullYear().toString().slice(-2)

  test('Case 2 with 7th digit as 4 and birthyear 20 returns true', () => {
    expect(validateIsOver18(`1004${ year }-4729`)).toBe(false)
  })

  test('Case 2 with 7th digit as 9 and birthyear 20 returns true', () => {
    expect(validateIsOver18(`1004${ year }-9729`)).toBe(false)
  })
})


//Note: Case 5 are people born in 18xx - they are definitely above 18!
describe('Test CPR age validation returns true for case 5', () => {

  test('Case 1 with 7th digit as 5 and age >57 returns true', () => {
    expect(validateIsOver18('100458-5729')).toBe(true)
  })

  test('Case 1 with 7th digit as 6 and age >57 returns true', () => {
    expect(validateIsOver18('100458-6729')).toBe(true)
  })

  test('Case 1 with 7th digit as 7 and age >57 returns true', () => {
    expect(validateIsOver18('100458-7729')).toBe(true)
  })

  test('Case 1 with 7th digit as 8 and age >57 returns true', () => {
    expect(validateIsOver18('100458-8729')).toBe(true)
  })
})

//Note: Case 4 are people born in 2000 - Now we need to check for true if people were born before 2007
describe('Test CPR age validation returns true for case 4 where the birthyear is < 6 (we do not care about the  current age at them moment)', () => {

  test('Case 1 with 7th digit as 5 and birthyear < 7 returns true', () => {
    expect(validateIsOver18('100406-5729')).toBe(true)
  })

  test('Case 1 with 7th digit as 6 and age <7 returns true', () => {
    expect(validateIsOver18('100406-6729')).toBe(true)
  })

  test('Case 1 with 7th digit as 7 and age <7 returns true', () => {
    expect(validateIsOver18('100406-7729')).toBe(true)
  })

  test('Case 1 with 7th digit as 8 and age <7 returns true', () => {
    expect(validateIsOver18('100406-8729')).toBe(true)
  })
})


//Note: Case 4 are people born in 2000 - Now we need to check for false if people were born after 2007
describe('Test CPR age validation returns false for case 4 where the birthyear this year - 17 years and 11 months.', () => {

  //Note: we need to deal with this test in the furture. Lets make the date dynamic
  const d = new Date()
  // Today minus 17 years and 11 months
  d.setFullYear(d.getFullYear() - 17)
  d.setMonth(d.getMonth() - 11)
  const day = d.getDate().toString().padStart(2, '0')
  const month = ( d.getMonth() + 1 ).toString().padStart(2, '0')
  const shortYear = d.getFullYear().toString().slice(-2)

  const cprPrefix = `${ day }${ month }${ shortYear }`

  test('Case 1 with 7th digit as 5 and 17 and 11 months old returns false', () => {
    console.log(`1004${ shortYear }-5729`)
    expect(validateIsOver18(`${ cprPrefix }-5729`)).toBe(false)
  })

  test('Case 1 with 7th digit as 6 and 17 and 11 months old returns false', () => {
    expect(validateIsOver18(`${ cprPrefix }-6729`)).toBe(false)
  })

  test('Case 1 with 7th digit as 7 and 17 and 11 months old returns false', () => {
    expect(validateIsOver18(`${ cprPrefix }-7729`)).toBe(false)
  })

  test('Case 1 with 7th digit as 8 and 17 and 11 months old returns false', () => {
    expect(validateIsOver18(`${ cprPrefix }-8729`)).toBe(false)
  })
})

describe('Test CPR age validation to throw an error for invalid CPR', () => {

  test('Invalid CPR number with less than 10 digits', () => {
    expect(validateIsOver18('123456789')).toBe(false)
  })
  test('Invalid CPR number with more than 10 digits', () => {
    expect(validateIsOver18('12345678901')).toBe(false)
  })
  test('Invalid CPR number with non-numeric characters', () => {
      expect(validateIsOver18('123456789a')).toBe(false)
    }
  )
  test('Invalid CPR number with special characters', () => {
      expect(validateIsOver18('1234@5678#90')).toBe(false)
    }
  )
  test('Invalid CPR number with letters', () => {
      expect(validateIsOver18('1234a5678b')).toBe(false)
    }
  )
  test('Invalid CPR number with empty string', () => {
      expect(validateIsOver18('')).toBe(false)
    }
  )
  test('Invalid CPR Control Digit', () => {
      expect(validateIsOver18('100499-A234')).toBe(false)
    }
  )
  test('Invalid CPR Day', () => {
      expect(validateIsOver18('990199-1234')).toBe(false)
    }
  )
  test('Invalid CPR Month', () => {
      expect(validateIsOver18('019999-1234')).toBe(false)
    }
  )
})