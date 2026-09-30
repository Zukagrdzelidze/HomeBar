# HomeBar

A catalogue of what a home bar has on its shelves and which cocktails it can make from it. The Admin manages stock; Guests browse the Cocktails the bar can make right now.

## Language

### People

**Admin**:
A person who can log in to add and Revoke Bottles, mark Mixers in or out of stock, view Cocktails and set their photos. Only one Admin can self-register, and registration closes once that account exists.
_Avoid_: User, owner, bartender

**Guest**:
Anyone browsing the bar's menu without logging in. A Guest only ever sees Makeable Cocktails and never sees stock.
_Avoid_: Customer, user, visitor

**Ingredient Pick**:
The in-stock Spirit Kinds and Mixers a Guest says they want in their drink. The menu shows every Makeable Cocktail containing all of them, or, when none does, the five closest.
_Avoid_: Filter, pantry

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
A fixed recipe: a name, Cocktail Ingredients, its Cups, a description, and whether it is served over ice, plus an optional photo. The Admin can change only the photo; the recipe itself is fixed.
_Avoid_: Drink, recipe (on its own)

**Cocktail Ingredient**:
One line of a Cocktail's recipe: an amount (free text, e.g. "2 oz") plus either a Spirit Kind or a Mixer.
_Avoid_: Ingredient (unqualified), component

**Cups**:
The glasses a Cocktail can be served in, best first, then fallbacks in order of preference. The first one is what the Guest menu shows.
_Avoid_: Cup Sequence, glassware list

**Cocktail Categories**:
The Spirit Kinds a Cocktail contains. These always come from its Cocktail Ingredients and are never chosen separately.
_Avoid_: Tags, type

**Makeable**:
A Cocktail is Makeable when every Spirit Kind it needs has at least one in-stock (or running-low) Bottle that is not a Sipping Bottle, and every Mixer it needs is in stock.
_Avoid_: Available, possible

**Missing Ingredient**:
A Spirit Kind or Mixer a Cocktail needs that current stock does not cover. Counted as distinct things to buy, not recipe lines: a recipe asking for gin twice with no gin has one Missing Ingredient.
_Avoid_: Needed item, shortage

**Shopping List**:
The Missing Ingredients that are each the only thing keeping one or more Cocktails from being Makeable, ranked by how many Cocktails buying that one thing would unlock.
_Avoid_: Buy list, wishlist
