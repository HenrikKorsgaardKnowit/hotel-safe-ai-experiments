# User stories


_The company defines a set of stories to drive the implementation effort. The following stories assume the safe has the factory default pin code "1234562 as the 6-digit proper pin code._

**Story 1: Unlock Safe:** _The user approaches the safe whose door is locked. The display is empty, which means it contains 6 spaces/blanks. The user hits the key-symbol button. The user enters his previously stored pin code by pressing the buttons one at the time: "1", "2", "3", "4", "5", "6". The display reacts by writing each digit as it is pressed. After the final "6" button press, the display clears and displays "OPEN  ". The safe door unlocks and can be opened._

**Story 2: Lock Safe:** _The safe door is unlocked. The display reads "OPEN  ". The user closes the door and presses the lock button. The door locks. The display reads "CLOSED"._

**Story 3: Forgetting key Button:** _The safe is locked. The user forgets to hit the key button first and hits "1". The display reads "ERROR ". All following button hits result in the display reading "ERROR ", unless the key button is pressed._

**Story 4: Wrong Code:** _The safe is locked. The user hits key followed by 1 2 4 3 5 6. The display is cleared. The safe remains locked._ 

**Story 5: Set New Code:** _The safe is open/unlocked. The user hits the pin button, enters a new six digit pin code, "777333", and finally hits the pin again. The safe’s display reads "CODE  ". It remains unlocked. After locking, the safe can only be unlocked (see story 1) by entering the new pin code "777333"._

### note
_Note: The scenarios above are not quite consistent: After locking the safe, the display reads "CLOSED" (and entering new pin "CODE  ") but then how does it get to the state where the display is cleared? In the real safe there will be a timer clearing the display after a short period but I will ignore this feature in the following discussion._

_Note also that story 2 is actually not complete as it only discusses the behavior of the lock button if the safe is unlocked, not what happens if it is pressed  while the safe is already locked. This, however, will be discovered in iteration 8._

Additional notes: We are not told why a blank display means that it contains 6 spaces/blanks instead of an empty string. This may be a hardware requirement that we are never informed about. From the provided interface, we can see the comment informing us that the readDisplay always returns a non-null string of exactly 6 characters that is printed on the display.

### Given code 
The original case study provide the reader with an Safe interface and an enum representing the button input. We follow the same, because it provide us with a useful starting point and interesting constraints.

```
// saft.ts
interface Safe {
    // Enter a button press on the safe
    enter(button: Button): void;
    /** Read the output of the display on the safe.
    ∗ POSTCONDITON : It is always a non−null string of
    ∗ exactly 6 characters that can be printed on
    ∗ a 7−segment display.
    ∗ @return: the output on the display 
    */
    readDisplay():string;
    /** Get the state of the safe: is it locked or not.
    * @return true if the safe is locked    
    */
    isLocked():boolean;
}
```

```
//safe.ts
export enum Button {
    D0,D1,D2,D3,D4,D5,D6,D7,D8,D9,LOCK,KEY,PIN
}
```