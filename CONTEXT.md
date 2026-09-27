# HomeBar

A catalogue of what a home bar has on its shelves and which cocktails it can make from it. Right now only the admin side is in scope; a public guest menu comes later.

## Language

### People

**Admin**:
A person who can log in to add and Revoke Bottles, mark Mixers in or out of stock, and view Cocktails. Only one Admin can self-register, and registration closes once that account exists.
_Avoid_: User, owner, bartender

### Stock

**Bottle**:
A specific bottle of alcohol on the shelf (e.g. "Tanqueray London Dry"). It has a Spirit Kind, a photo, a Description and a Bottle Status.
_Avoid_: Alcohol, spirit, liquor

**Spirit Kind**:
The kind of alcohol a Bottle is (e.g. GIN, BOURBON, CAMPARI). Cocktails ask for a Spirit Kind, never for a specific Bottle.
_Avoid_: Drink type, category, alcohol type

**Bottle Status**:
Where a Bottle stands on the shelf: in stock, running low, or empty.
_Avoid_: State, availability

**Revoke**:
Marking a Bottle as empty. The Bottle and its Description stay on record, and the Bottle can be restocked later instead of being added again.
_Avoid_: Delete, remove, archive

**Sipping Bottle**:
A Bottle that is not for cocktails. It never counts toward making a Cocktail.
_Avoid_: Reserved, premium

**Mixer**:
A non-alcoholic ingredient (juice, syrup, soda, garnish, sugar) from a fixed list. The only thing that changes about it is whether it is in stock.
_Avoid_: Non-alcohol, NonAlcoholEntity, ingredient (on its own)

**Description** (of a Bottle):
The Admin's free-text review or tasting note about a Bottle.
_Avoid_: Note, review, comment

### Cocktails

**Cocktail**:
A fixed recipe: a name, Cocktail Ingredients, a Cup Sequence, a description, and whether it is served over ice. The Admin views Cocktails but does not edit them.
_Avoid_: Drink, recipe (on its own)

**Cocktail Ingredient**:
One line of a Cocktail's recipe: an amount (free text, e.g. "2 oz") plus either a Spirit Kind or a Mixer.
_Avoid_: Ingredient (unqualified), component

**Cup Sequence**:
The ordered list of vessels a Cocktail passes through. The last one is the glass it is served in (e.g. shaker → coupe).
_Avoid_: Sequence of cups, glassware list

**Cocktail Categories**:
The Spirit Kinds a Cocktail contains. These always come from its Cocktail Ingredients and are never chosen separately.
_Avoid_: Tags, type

**Makeable**:
A Cocktail is Makeable when every Spirit Kind it needs has at least one in-stock (or running-low) Bottle that is not a Sipping Bottle, and every Mixer it needs is in stock.
_Avoid_: Available, possible
