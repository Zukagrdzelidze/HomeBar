# Cocktails and Mixers are managed by Flyway migrations, not the admin UI

The Admin can only view Cocktails and only toggle a Mixer's stock. Both lists are seed data added through versioned Flyway migrations. This was a deliberate choice: the recipe book stays versioned and reviewed alongside the code, and a Cocktail Ingredient can never point at a Mixer that was renamed or deleted in the UI. The consequence is that every new Cocktail, typo fix or new Mixer ships as a new migration. Applied migrations are never edited. If this becomes painful, the next step is admin CRUD for Cocktails, not editing old migrations.

**Exception: Cocktail photos.** The Admin uploads and removes a Cocktail's photo in the UI, the same way as Bottle photos and stored the same way (ADR 0003). Binary images don't belong in SQL migrations. A photo isn't part of the recipe, so letting the Admin change it doesn't undo the reasons above.
