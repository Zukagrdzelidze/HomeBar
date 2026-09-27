# Cocktails reference Spirit Kinds, not Bottles

A Cocktail Ingredient names a Spirit Kind (e.g. GIN), never a specific Bottle. A Cocktail is Makeable when any in-stock Bottle of that Spirit Kind that isn't a Sipping Bottle exists. We chose this because Bottles come and go (they get Revoked, restocked, or replaced by other brands), and recipes shouldn't break when that happens. The cost is that a recipe can't ask for a particular brand. If that's ever needed, it has to be added as an optional preference on top of the Spirit Kind, not as a replacement for it.
